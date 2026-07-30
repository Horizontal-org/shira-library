import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { createHash } from "crypto"
import { DRIZZLE } from "../../db/drizzle.constants"
import { ImagesService } from "../services/images.service"
import { InvalidFileTypeImageException } from "../exceptions/invalid-file-type.image.exception"
import { MINIO_TOKEN } from "../decorators/minio.decorator"

const mockFileTypeFromBuffer = jest.fn()
jest.mock("file-type", () => ({
  fileTypeFromBuffer: (...args: unknown[]) => mockFileTypeFromBuffer(...args),
}), { virtual: true })

describe("ImagesService", () => {
  let service: ImagesService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
  }

  const mockMinio = {
    putObject: jest.fn(),
    presignedUrl: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue("library-images"),
  }

  const file = {
    originalname: "screenshot.png",
    buffer: Buffer.from("fake-bytes"),
    size: 10,
  } as Express.Multer.File

  const fileHash = createHash("sha256").update(file.buffer).digest("hex")

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.insert.mockReturnThis()
    mockConfigService.get.mockReturnValue("library-images")

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: MINIO_TOKEN, useValue: mockMinio },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<ImagesService>(ImagesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("throws when LIBRARY_IMAGE_BUCKET is not configured", async () => {
    mockConfigService.get.mockReturnValue(undefined)

    const module = Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: MINIO_TOKEN, useValue: mockMinio },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })

    await expect(module.compile()).rejects.toThrow("LIBRARY_IMAGE_BUCKET environment variable is required")
  })

  describe("upload", () => {
    it("rejects a file whose real MIME type is not an allowed image type", async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: "application/pdf" })

      await expect(service.upload(file)).rejects.toThrow(InvalidFileTypeImageException)
      expect(mockMinio.putObject).not.toHaveBeenCalled()
    })

    it("rejects a file whose type cannot be detected", async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce(undefined)

      await expect(service.upload(file)).rejects.toThrow(InvalidFileTypeImageException)
    })

    it("stores a new image and inserts a row keyed by its content hash when no match exists", async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: "image/png" })
      mockDb.where.mockResolvedValueOnce([])
      mockDb.values.mockResolvedValueOnce([{ insertId: 42 }])

      const result = await service.upload(file)

      expect(mockMinio.putObject).toHaveBeenCalledWith(
        "library-images",
        expect.stringContaining("question-template-images/"),
        file.buffer,
        file.size,
      )
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({ hash: fileHash, name: "screenshot.png" }),
      )
      expect(result).toEqual({ id: 42, relativePath: expect.stringContaining("question-template-images/") })
    })

    it("reuses the existing image row and skips Minio when the hash already exists", async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: "image/png" })
      mockDb.where.mockResolvedValueOnce([
        { id: 5, hash: fileHash, relativePath: "question-template-images/existing.png", name: "existing.png" },
      ])

      const result = await service.upload(file)

      expect(mockMinio.putObject).not.toHaveBeenCalled()
      expect(mockDb.insert).not.toHaveBeenCalled()
      expect(result).toEqual({ id: 5, relativePath: "question-template-images/existing.png" })
    })

    it("links the image to a question at upload time when questionId is given", async () => {
      mockFileTypeFromBuffer.mockResolvedValueOnce({ mime: "image/jpeg" })
      mockDb.where
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
      mockDb.values
        .mockResolvedValueOnce([{ insertId: 7 }])
        .mockResolvedValueOnce(undefined)

      await service.upload(file, 99)

      expect(mockDb.insert).toHaveBeenCalledTimes(2)
      expect(mockDb.values).toHaveBeenNthCalledWith(2, [{ imageId: 7, questionId: 99 }])
    })
  })

  describe("linkToQuestion", () => {
    it("does nothing when given an empty id list", async () => {
      await service.linkToQuestion([], 1)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it("inserts only pairs that are not already linked", async () => {
      mockDb.where.mockResolvedValueOnce([{ imageId: 1 }])

      await service.linkToQuestion([1, 2], 5)

      expect(mockDb.insert).toHaveBeenCalledTimes(1)
      expect(mockDb.values).toHaveBeenCalledWith([{ imageId: 2, questionId: 5 }])
    })

    it("does not insert when every pair is already linked", async () => {
      mockDb.where.mockResolvedValueOnce([{ imageId: 1 }, { imageId: 2 }])

      await service.linkToQuestion([1, 2], 5)

      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe("findByQuestionId", () => {
    it("joins images through the link table for a single question", async () => {
      const rows = [{ id: 1, name: "a.png", relativePath: "question-template-images/a.png" }]
      mockDb.where.mockResolvedValueOnce(rows)

      const result = await service.findByQuestionId(10)

      expect(mockDb.innerJoin).toHaveBeenCalled()
      expect(result).toEqual(rows)
    })
  })

  describe("findByQuestionIds", () => {
    it("returns an empty array for an empty id list without querying", async () => {
      const result = await service.findByQuestionIds([])

      expect(result).toEqual([])
      expect(mockDb.select).not.toHaveBeenCalled()
    })

    it("joins images through the link table for multiple questions", async () => {
      const rows = [{ questionId: 10, id: 1, name: "a.png", relativePath: "question-template-images/a.png" }]
      mockDb.where.mockResolvedValueOnce(rows)

      const result = await service.findByQuestionIds([10, 11])

      expect(result).toEqual(rows)
    })
  })

  describe("getPresignedUrl", () => {
    it("delegates to the Minio client", async () => {
      mockMinio.presignedUrl.mockResolvedValueOnce("https://example.com/signed")

      const url = await service.getPresignedUrl("question-template-images/foo.png")

      expect(url).toBe("https://example.com/signed")
      expect(mockMinio.presignedUrl).toHaveBeenCalledWith("GET", "library-images", "question-template-images/foo.png")
    })
  })
})
