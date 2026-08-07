import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { AuthorsService } from "../services/authors.service"
import { NotFoundAuthorException } from "../exceptions/not-found.author.exception"
import { DisplayNameTakenAuthorException } from "../exceptions/display-name-taken.author.exception"

describe("AuthorsService", () => {
  let service: AuthorsService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<AuthorsService>(AuthorsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findAll", () => {
    it("selects only the public columns, excluding apiKeyHash", async () => {
      mockDb.from.mockResolvedValueOnce([{ id: 4, spaceName: "acme" }])

      const result = await service.findAll()

      const selectArg = mockDb.select.mock.calls[0][0]
      expect(selectArg).not.toHaveProperty("apiKeyHash")
      expect(selectArg).toHaveProperty("apiKeyPrefix")
      expect(selectArg).toHaveProperty("apiKeyRevokedAt")
      expect(result).toEqual([{ id: 4, spaceName: "acme" }])
    })
  })

  describe("findOne", () => {
    it("selects only the public columns, excluding apiKeyHash", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: 4, spaceName: "acme" }])

      await service.findOne(4)

      const selectArg = mockDb.select.mock.calls[0][0]
      expect(selectArg).not.toHaveProperty("apiKeyHash")
    })
  })

  describe("update", () => {
    it("throws NotFoundAuthorException when the id does not match an author", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.update(99, { spaceName: "new-name" })).rejects.toThrow(NotFoundAuthorException)
    })

    it("updates and returns the row on success", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4, spaceName: "old-name" }])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ id: 4, spaceName: "new-name" }])

      const result = await service.update(4, { spaceName: "new-name" })

      expect(result).toEqual({ id: 4, spaceName: "new-name" })
    })

    it("throws DisplayNameTakenAuthorException when the new spaceDisplayName is already used by another author", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4, spaceDisplayName: "Old Corp" }])
        .mockResolvedValueOnce([{ id: 7, spaceDisplayName: "Acme Corp" }])

      await expect(service.update(4, { spaceDisplayName: "Acme Corp" })).rejects.toThrow(DisplayNameTakenAuthorException)
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe("findByApiKeyHash", () => {
    it("returns the matching non-revoked author", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: 4, apiKeyHash: "hash123" }])

      await expect(service.findByApiKeyHash("hash123")).resolves.toEqual({ id: 4, apiKeyHash: "hash123" })
    })

    it("returns null when no author matches", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.findByApiKeyHash("unknown")).resolves.toBeNull()
    })
  })

  describe("revokeApiKey", () => {
    it("throws NotFoundAuthorException when the id does not match an author", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.revokeApiKey(99)).rejects.toThrow(NotFoundAuthorException)
    })

    it("sets apiKeyRevokedAt and returns the updated row", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4 }])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ id: 4, apiKeyRevokedAt: new Date("2026-01-01") }])

      const result = await service.revokeApiKey(4)

      expect(mockDb.update).toHaveBeenCalled()
      expect(result).toEqual({ id: 4, apiKeyRevokedAt: new Date("2026-01-01") })
    })
  })

  describe("setApiKey", () => {
    it("stores the hash and prefix and returns the updated row", async () => {
      mockDb.where
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ id: 4, apiKeyHash: "hash123", apiKeyPrefix: "slib_abcd" }])

      const result = await service.setApiKey(4, "hash123", "slib_abcd")

      expect(mockDb.update).toHaveBeenCalled()
      expect(result).toEqual({ id: 4, apiKeyHash: "hash123", apiKeyPrefix: "slib_abcd" })
    })
  })

  describe("isDisplayNameTaken", () => {
    it("returns true when a match exists", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: 1 }])

      await expect(service.isDisplayNameTaken("Acme Corp")).resolves.toBe(true)
    })

    it("returns false when no match exists", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.isDisplayNameTaken("Nobody Corp")).resolves.toBe(false)
    })

    it("returns false when the only match is the excluded id", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.isDisplayNameTaken("Acme Corp", 1)).resolves.toBe(false)
    })
  })
})
