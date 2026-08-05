import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { CreateQuestionTemplatesService } from "../services/create.question-templates.service"

describe("CreateQuestionTemplatesService", () => {
  let service: CreateQuestionTemplatesService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockResolvedValue([])
    mockDb.insert.mockReturnThis()
    mockDb.values.mockResolvedValue([{ insertId: 1 }])

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateQuestionTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<CreateQuestionTemplatesService>(CreateQuestionTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("sanitizes content but leaves plain-text description untouched", async () => {
    await service.create({
      name: "Suspicious SMS",
      description: "Score < 50% to fail",
      content: '<p>content</p><img src=x onerror=alert(1)>',
      appType: "sms",
      isPhishing: true,
    })

    expect(mockDb.values).toHaveBeenNthCalledWith(1, expect.objectContaining({
      description: "Score < 50% to fail",
      content: expect.not.stringContaining("onerror"),
    }))
  })

  it("sanitizes explanation content before inserting explanations", async () => {
    mockDb.values
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce(undefined)

    await service.create({
      name: "Suspicious SMS",
      content: "<p>content</p>",
      appType: "sms",
      isPhishing: true,
      explanations: [
        { position: "top", positionIndex: "0", content: '<p>ok</p><script>alert(1)</script>' },
      ],
    })

    expect(mockDb.values).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({ content: "<p>ok</p>" }),
    ])
  })

  describe("duplicate content detection", () => {
    it("throws when the same author resubmits identical content", async () => {
      mockDb.where.mockResolvedValueOnce([{ id: 5 }])

      await expect(
        service.create({
          name: "Suspicious SMS",
          content: "<p>content</p>",
          appType: "sms",
          isPhishing: true,
          authorId: 1,
        }),
      ).rejects.toThrow("question_template_duplicate_content")

      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    it("allows a different author to submit the same content", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(
        service.create({
          name: "Suspicious SMS",
          content: "<p>content</p>",
          appType: "sms",
          isPhishing: true,
          authorId: 2,
        }),
      ).resolves.toBe(1)
    })

    it("skips the duplicate check when no authorId is given", async () => {
      await service.create({
        name: "Suspicious SMS",
        content: "<p>content</p>",
        appType: "sms",
        isPhishing: true,
      })

      expect(mockDb.select).not.toHaveBeenCalled()
    })
  })
})
