import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { PublishQuizTemplatesService } from "../services/publish-quiz.service"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { Author } from "../../db/schema/authors"
import { CreateQuestionTemplatesService } from "../../question-templates/services/create.question-templates.service"
import { TagsService } from "../../tags/services/tags.service"
import { LangTagsService } from "../../lang-tags/services/lang-tags.service"
import { ImagesService } from "../../images/services/images.service"

describe("PublishQuizTemplatesService", () => {
  let service: PublishQuizTemplatesService

  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
  }

  const mockQuizService = {
    linkQuizRelations: jest.fn(),
    findOne: jest.fn(),
  }

  const mockCreateQuestionService = {
    create: jest.fn(),
  }

  const mockTagsService = {
    validateIds: jest.fn(),
  }

  const mockLangTagsService = {
    validateIds: jest.fn(),
  }

  const mockImagesService = {
    linkToQuestion: jest.fn(),
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
    mockDb.insert.mockReturnThis()
    mockDb.values.mockResolvedValue([{ insertId: 1 }])

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishQuizTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: QuizTemplatesService, useValue: mockQuizService },
        { provide: CreateQuestionTemplatesService, useValue: mockCreateQuestionService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: LangTagsService, useValue: mockLangTagsService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile()

    service = module.get<PublishQuizTemplatesService>(PublishQuizTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("links each question's submitted template image ids to the question it created", async () => {
    mockCreateQuestionService.create
      .mockResolvedValueOnce(21)
      .mockResolvedValueOnce(22)

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

    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([10, 11], 21)
    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([12], 22)
  })

  it("links an empty array when a question submits no template image ids", async () => {
    mockCreateQuestionService.create.mockResolvedValueOnce(30)

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

    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([], 30)
  })
})
