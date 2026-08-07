import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { PublishQuestionTemplatesService } from "../services/publish-question-templates.service"
import { Author } from "../../db/schema/authors"
import { CreateQuestionTemplatesService } from "../services/create.question-templates.service"
import { TagsService } from "../../tags/services/tags.service"
import { LangTagsService } from "../../lang-tags/services/lang-tags.service"
import { ImagesService } from "../../images/services/images.service"

describe("PublishQuestionTemplatesService", () => {
  let service: PublishQuestionTemplatesService

  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
  }

  const mockCreateQuestionTemplatesService = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishQuestionTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: CreateQuestionTemplatesService, useValue: mockCreateQuestionTemplatesService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: LangTagsService, useValue: mockLangTagsService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile()

    service = module.get<PublishQuestionTemplatesService>(PublishQuestionTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("links the submitted template image ids to the newly created question", async () => {
    mockCreateQuestionTemplatesService.create.mockResolvedValueOnce(21)

    await service.publish({
      name: "Suspicious SMS",
      content: "<p>content</p>",
      appType: "sms",
      isPhishing: true,
      templateImageIds: [10, 11],
    }, author)

    expect(mockCreateQuestionTemplatesService.create).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: author.id }),
    )
    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([10, 11], 21)
  })

  it("links an empty array when no template image ids are submitted", async () => {
    mockCreateQuestionTemplatesService.create.mockResolvedValueOnce(22)

    await service.publish({
      name: "Suspicious SMS",
      content: "<p>content</p>",
      appType: "sms",
      isPhishing: true,
    }, author)

    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([], 22)
  })
})
