import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { QuizTemplatesService } from "../services/quiz-templates.service"

describe("QuizTemplatesService", () => {
  let service: QuizTemplatesService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<QuizTemplatesService>(QuizTemplatesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findAll", () => {
    it("should return all quiz templates", async () => {
      const expected = [{ id: 1, title: "Test Quiz" }]
      mockDb.select.mockReturnThis()
      mockDb.from.mockReturnValue(expected)

      const result = await service.findAll()
      expect(result).toEqual(expected)
    })
  })
})
