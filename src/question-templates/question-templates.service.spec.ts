import { Test, TestingModule } from "@nestjs/testing";
import { DRIZZLE } from "../db/drizzle.constants";
import { QuestionTemplatesService } from "./question-templates.service";

describe("QuestionTemplatesService", () => {
  let service: QuestionTemplatesService;

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionTemplatesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<QuestionTemplatesService>(QuestionTemplatesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByQuiz", () => {
    it("should return questions for a quiz template", async () => {
      const expected = [{ id: 1, question: "What is 2+2?", quizTemplateId: 1 }];
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.orderBy.mockReturnValue(expected);

      const result = await service.findByQuiz(1);
      expect(result).toEqual(expected);
    });
  });
});
