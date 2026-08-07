import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { NotFoundQuestionTemplateException } from "../exceptions/not-found.question-template.exception"
import { QuestionTemplatesService } from "../services/question-templates.service"
import { AuthorsService } from "../../authors/services/authors.service"
import { CreateQuestionTemplatesService } from "../services/create.question-templates.service"
import { TagsService } from "../../tags/services/tags.service"
import { LangTagsService } from "../../lang-tags/services/lang-tags.service"
import { ImagesService } from "../../images/services/images.service"

describe("QuestionTemplatesService", () => {
  let service: QuestionTemplatesService

  const mockAuthorsService = {
    findOrCreate: jest.fn(),
  }

  const mockImagesService = {
    findByQuestionId: jest.fn(),
    getPresignedUrl: jest.fn(),
    linkToQuestion: jest.fn(),
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

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: AuthorsService, useValue: mockAuthorsService },
        { provide: CreateQuestionTemplatesService, useValue: mockCreateQuestionTemplatesService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: LangTagsService, useValue: mockLangTagsService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile()

    service = module.get<QuestionTemplatesService>(QuestionTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findOne approval visibility", () => {
    it("throws not found for an unapproved template when approval is required", async () => {
      mockDb.where.mockResolvedValueOnce([{ question: { id: 1, approved: false }, author: null }])

      await expect(
        service.findOne(1, { requireApproved: true }),
      ).rejects.toThrow(NotFoundQuestionTemplateException)
    })

    it("returns an unapproved template by default", async () => {
      mockDb.where.mockResolvedValueOnce([{ question: { id: 1, approved: false }, author: null }])

      await expect(
        service.findOne(1),
      ).resolves.toEqual({ id: 1, approved: false, author: null })
    })

    it("returns an approved template by default", async () => {
      mockDb.where.mockResolvedValueOnce([{ question: { id: 1, approved: true }, author: null }])

      await expect(service.findOne(1)).resolves.toEqual({ id: 1, approved: true, author: null })
    })
  })

  describe("update", () => {
    it("leaves plain-text description untouched", async () => {
      mockImagesService.findByQuestionId.mockResolvedValueOnce([])

      mockDb.where
        .mockReturnValueOnce(mockDb) // update(...).set(...).where(...)
        .mockResolvedValueOnce([{ question: { id: 1, approved: true }, author: null }]) // findOneEnriched -> findOne
        .mockResolvedValueOnce([]) // langTagRows
        .mockResolvedValueOnce([]) // tagRows
        .mockResolvedValueOnce([]) // explanationRows

      await service.update(1, { description: "Score < 50% to fail" })

      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({ description: "Score < 50% to fail" }))
    })
  })
})
