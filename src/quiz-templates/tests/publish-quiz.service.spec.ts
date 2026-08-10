import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { PublishQuizTemplatesService } from "../services/publish-quiz.service"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { Author } from "../../db/schema/authors"
import { TagsService } from "../../tags/services/tags.service"
import { LangTagsService } from "../../lang-tags/services/lang-tags.service"

describe("PublishQuizTemplatesService", () => {
  let service: PublishQuizTemplatesService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
    transaction: jest.fn(),
  }

  const mockQuizService = {
    findOne: jest.fn(),
  }

  const mockTagsService = {
    validateIds: jest.fn(),
  }

  const mockLangTagsService = {
    validateIds: jest.fn(),
  }

  const author: Author = {
    id: 3,
    publicSpaceId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    spaceName: "acme",
    spaceDisplayName: "Acme",
    organizationName: "Acme Corp",
    apiKeyHash: null,
    apiKeyPrefix: null,
    apiKeyRevokedAt: null,
    createdAt: new Date("2026-01-01"),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockResolvedValue([])
    mockDb.insert.mockReturnThis()
    mockDb.values.mockResolvedValue([{ insertId: 1 }])
    mockDb.transaction.mockImplementation(async (callback) => callback(mockDb))

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishQuizTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: QuizTemplatesService, useValue: mockQuizService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: LangTagsService, useValue: mockLangTagsService },
      ],
    }).compile()

    service = module.get<PublishQuizTemplatesService>(PublishQuizTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("creates questions and links their submitted template images inside the transaction", async () => {
    mockDb.values
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 21 }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ insertId: 22 }])
      .mockResolvedValueOnce(undefined)

    await service.publish({
      title: "Phishing basics",
      description: "A quiz about phishing basics",
      questions: [
        {
          name: "Suspicious SMS",
          content: "<p>content 1</p>",
          appType: "sms",
          isPhishing: true,
          templateImageIds: [10, 11],
        },
        {
          name: "Suspicious email",
          content: "<p>content 2</p>",
          appType: "email",
          isPhishing: true,
          templateImageIds: [12],
        },
      ],
    }, author)

    expect(mockDb.values).toHaveBeenCalledWith([
      { imageId: 10, questionId: 21 },
      { imageId: 11, questionId: 21 },
    ])
    expect(mockDb.values).toHaveBeenCalledWith([{ imageId: 12, questionId: 22 }])
    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
  })

  it("does not create image links when a question submits no template image ids", async () => {
    mockDb.values
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 30 }])

    await service.publish({
      title: "Phishing basics",
      description: "A quiz about phishing basics",
      questions: [
        {
          name: "Suspicious SMS",
          content: "<p>content</p>",
          appType: "sms",
          isPhishing: true,
        },
      ],
    }, author)

    expect(mockDb.values).not.toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ imageId: expect.any(Number) }),
    ]))
  })

  it("reuses an existing question and does not create its images again", async () => {
    mockDb.where.mockResolvedValueOnce([{ id: 42 }])

    await service.publish({
      title: "Phishing basics",
      description: "A quiz about phishing basics",
      questions: [{
        name: "Suspicious SMS",
        content: "<p>content</p>",
        appType: "sms",
        isPhishing: true,
        templateImageIds: [10],
      }],
    }, author)

    expect(mockDb.values).toHaveBeenCalledWith([{ quizId: 1, questionId: 42 }])
    expect(mockDb.values).not.toHaveBeenCalledWith(expect.objectContaining({ contentHash: expect.any(String) }))
  })

})
