import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { AuthorsService } from "../../authors/services/authors.service"
import { ImagesService } from "../../images/services/images.service"
import { NotFoundQuizTemplateException } from "../exceptions/not-found.quiz-template.exception"

describe("QuizTemplatesService", () => {
  let service: QuizTemplatesService

  const mockAuthorsService = {
    findOrCreate: jest.fn(),
  }

  const mockImagesService = {
    findByQuestionIds: jest.fn().mockResolvedValue([]),
    getPresignedUrl: jest.fn(),
  }

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue([{ insertId: 1 }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockImagesService.findByQuestionIds.mockResolvedValue([])

    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
    mockDb.leftJoin.mockReturnThis()
    mockDb.where.mockResolvedValue([])
    mockDb.insert.mockReturnThis()
    mockDb.values.mockResolvedValue([{ insertId: 1 }])
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()
    mockDb.delete.mockReturnThis()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: AuthorsService, useValue: mockAuthorsService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile()

    service = module.get<QuizTemplatesService>(QuizTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findOne", () => {
    it("should return the quiz template when found", async () => {
      const quiz = { id: 1, title: "Test Quiz", createdAt: new Date() }
      mockDb.where.mockResolvedValueOnce([{ quiz, author: null }])

      const result = await service.findOne(1)
      expect(result).toEqual({ ...quiz, author: null })
    })

    it("should throw NotFoundQuizTemplateException when not found", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.findOne(999)).rejects.toThrow(NotFoundQuizTemplateException)
    })

    it("should throw NotFoundQuizTemplateException when not approved and requireApproved is set", async () => {
      mockDb.where.mockResolvedValueOnce([{ quiz: { id: 1, approved: false }, author: null }])

      await expect(
        service.findOne(1, { requireApproved: true }),
      ).rejects.toThrow(NotFoundQuizTemplateException)
    })

    it("should return the quiz template when approved and requireApproved is set", async () => {
      const quiz = { id: 1, approved: true }
      mockDb.where.mockResolvedValueOnce([{ quiz, author: null }])

      await expect(service.findOne(1, { requireApproved: true })).resolves.toEqual({ ...quiz, author: null })
    })

    it("should not require approval when the flag is omitted", async () => {
      const quiz = { id: 1, approved: false }
      mockDb.where.mockResolvedValueOnce([{ quiz, author: null }])

      await expect(service.findOne(1)).resolves.toEqual({ ...quiz, author: null })
    })
  })

  describe("create", () => {
    it("should insert quiz and questions then return the created quiz", async () => {
      const quiz = { id: 1, title: "New Quiz", createdAt: new Date() }
      mockDb.values
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce(undefined)
      mockDb.where.mockResolvedValueOnce([{ quiz, author: null }])

      const result = await service.create({
        title: "New Quiz",
        description: "A new quiz",
        questionIds: [10, 20],
      })

      expect(result).toEqual({ ...quiz, author: null })
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })
  })

  describe("findQuestions", () => {
    it("attaches images grouped per question with presigned urls", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ quiz: { id: 1, title: "Quiz", approved: true }, author: null }]) // findOne
        .mockResolvedValueOnce([
          { quizQuestionId: 1, questionId: 10, questionName: "Q1", isPhishing: true, defaultApp: "Gmail", appType: "email", content: "<p>c1</p>" },
          { quizQuestionId: 2, questionId: 20, questionName: "Q2", isPhishing: false, defaultApp: null, appType: "sms", content: "<p>c2</p>" },
        ]) // questionRows
        .mockResolvedValueOnce([]) // languageRows
        .mockResolvedValueOnce([]) // explanationRows

      mockImagesService.findByQuestionIds.mockResolvedValueOnce([
        { questionId: 10, id: 100, name: "a.png", relativePath: "question-template-images/a.png" },
        { questionId: 20, id: 200, name: "b.png", relativePath: "question-template-images/b.png" },
      ])
      mockImagesService.getPresignedUrl.mockImplementation(async (relativePath: string) => `https://example.com/${relativePath}`)

      const result = await service.findQuestions(1)

      expect(result).toHaveLength(2)
      expect(result[0].images).toEqual([
        { id: 100, name: "a.png", url: "https://example.com/question-template-images/a.png" },
      ])
      expect(result[1].images).toEqual([
        { id: 200, name: "b.png", url: "https://example.com/question-template-images/b.png" },
      ])
    })

    it("returns an empty images array when a question has no images", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ quiz: { id: 1, title: "Quiz", approved: true }, author: null }])
        .mockResolvedValueOnce([
          { quizQuestionId: 1, questionId: 10, questionName: "Q1", isPhishing: true, defaultApp: "Gmail", appType: "email", content: "<p>c1</p>" },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      mockImagesService.findByQuestionIds.mockResolvedValueOnce([])

      const result = await service.findQuestions(1)

      expect(result[0].images).toEqual([])
      expect(mockImagesService.getPresignedUrl).not.toHaveBeenCalled()
    })
  })

  describe("remove", () => {
    it("should delete the quiz template", async () => {
      mockDb.where.mockResolvedValueOnce(undefined)

      await service.remove(1)

      expect(mockDb.delete).toHaveBeenCalledTimes(1)
    })
  })
})
