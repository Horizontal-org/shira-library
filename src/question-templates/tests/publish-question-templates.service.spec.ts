import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { PublishQuestionTemplatesService } from "../services/publish-question-templates.service"
import { AuthorsService } from "../../authors/services/authors.service"
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

  const mockAuthorsService = {
    findOrCreate: jest.fn(),
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

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.insert.mockReturnThis()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishQuestionTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: AuthorsService, useValue: mockAuthorsService },
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
    mockAuthorsService.findOrCreate.mockResolvedValueOnce({ id: 3 })
    mockCreateQuestionTemplatesService.create.mockResolvedValueOnce(21)

    await service.publish({
      name: "Suspicious SMS",
      content: "<p>content</p>",
      appType: "sms",
      isPhishing: true,
      author: {
        publicSpaceId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        spaceName: "acme",
        spaceDisplayName: "Acme",
        organizationName: "Acme Corp",
      },
      templateImageIds: [10, 11],
    })

    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([10, 11], 21)
  })

  it("links an empty array when no template image ids are submitted", async () => {
    mockAuthorsService.findOrCreate.mockResolvedValueOnce({ id: 3 })
    mockCreateQuestionTemplatesService.create.mockResolvedValueOnce(22)

    await service.publish({
      name: "Suspicious SMS",
      content: "<p>content</p>",
      appType: "sms",
      isPhishing: true,
      author: {
        publicSpaceId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        spaceName: "acme",
        spaceDisplayName: "Acme",
        organizationName: "Acme Corp",
      },
    })

    expect(mockImagesService.linkToQuestion).toHaveBeenCalledWith([], 22)
  })
})
