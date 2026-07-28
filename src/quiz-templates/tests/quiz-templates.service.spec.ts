import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { AuthorsService } from "../../authors/services/authors.service"
import { NotFoundQuizTemplateException } from "../exceptions/not-found.quiz-template.exception"

describe("QuizTemplatesService", () => {
  let service: QuizTemplatesService

  const mockAuthorsService = {
    findOrCreate: jest.fn(),
  }

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue([{ insertId: 1 }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()
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
      mockDb.where.mockResolvedValueOnce([quiz])

      const result = await service.findOne(1)
      expect(result).toEqual(quiz)
    })

    it("should throw NotFoundQuizTemplateException when not found", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.findOne(999)).rejects.toThrow(NotFoundQuizTemplateException)
    })
  })

  describe("create", () => {
    it("should insert quiz and questions then return the created quiz", async () => {
      const quiz = { id: 1, title: "New Quiz", createdAt: new Date() }
      mockDb.values
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce(undefined)
      mockDb.where.mockResolvedValueOnce([quiz])

      const result = await service.create({ title: "New Quiz", questionIds: [10, 20] })

      expect(result).toEqual(quiz)
      expect(mockDb.insert).toHaveBeenCalledTimes(2)
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
