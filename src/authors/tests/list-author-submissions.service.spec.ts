import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { ListAuthorSubmissionsService } from "../services/list-author-submissions.service"
import { NotFoundAuthorException } from "../exceptions/not-found.author.exception"

describe("ListAuthorSubmissionsService", () => {
  let service: ListAuthorSubmissionsService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.innerJoin.mockReturnThis()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAuthorSubmissionsService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<ListAuthorSubmissionsService>(ListAuthorSubmissionsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findAllQuestionTemplatesForAuthor", () => {
    it("throws NotFoundAuthorException when the publicSpaceId does not match an author", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.findAllQuestionTemplatesForAuthor("unknown-space", 1, 20)).rejects.toThrow(NotFoundAuthorException)
    })

    it("maps rows, omitting reason when there is none, and returns pagination info", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4 }])
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce([{ total: 1 }])
      mockDb.orderBy.mockReturnValueOnce(mockDb)
      mockDb.limit.mockReturnValueOnce(mockDb)
      mockDb.offset.mockResolvedValueOnce([
        {
          id: 1,
          questionName: "Anti-virus marketing",
          createdAt: new Date("2026-07-21T10:00:00.000Z"),
          status: "in_review",
          rejectedNote: null,
        },
      ])

      const result = await service.findAllQuestionTemplatesForAuthor("01HZY3K6X4G8VZJ2E9QWERTY12", 1, 20)

      expect(result).toEqual({
        data: [
          {
            id: "1",
            questionName: "Anti-virus marketing",
            dateSubmitted: "2026-07-21",
            status: "in_review",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      })
    })

    it("includes reason when the submission was rejected", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4 }])
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce([{ total: 3 }])
      mockDb.orderBy.mockReturnValueOnce(mockDb)
      mockDb.limit.mockReturnValueOnce(mockDb)
      mockDb.offset.mockResolvedValueOnce([
        {
          id: 3,
          questionName: "Question for healthcare providers",
          createdAt: new Date("2026-07-03T10:00:00.000Z"),
          status: "rejected",
          rejectedNote: "does not apply",
        },
      ])

      const result = await service.findAllQuestionTemplatesForAuthor("01HZY3K6X4G8VZJ2E9QWERTY12", 2, 1)

      expect(result).toEqual({
        data: [
          {
            id: "3",
            questionName: "Question for healthcare providers",
            dateSubmitted: "2026-07-03",
            status: "rejected",
            reason: "does not apply",
          },
        ],
        total: 3,
        page: 2,
        limit: 1,
      })
    })
  })

  describe("findAllQuizTemplatesForAuthor", () => {
    it("throws NotFoundAuthorException when the publicSpaceId does not match an author", async () => {
      mockDb.where.mockResolvedValueOnce([])

      await expect(service.findAllQuizTemplatesForAuthor("unknown-space", 1, 20)).rejects.toThrow(NotFoundAuthorException)
    })

    it("maps rows, omitting reason when there is none, and returns pagination info", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4 }])
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce([{ total: 1 }])
      mockDb.orderBy.mockReturnValueOnce(mockDb)
      mockDb.limit.mockReturnValueOnce(mockDb)
      mockDb.offset.mockResolvedValueOnce([
        {
          id: 1,
          quizTitle: "Cybersecurity basics",
          createdAt: new Date("2026-07-21T10:00:00.000Z"),
          status: "in_review",
          rejectedNote: null,
        },
      ])

      const result = await service.findAllQuizTemplatesForAuthor("01HZY3K6X4G8VZJ2E9QWERTY12", 1, 20)

      expect(result).toEqual({
        data: [
          {
            id: "1",
            quizTitle: "Cybersecurity basics",
            dateSubmitted: "2026-07-21",
            status: "in_review",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      })
    })

    it("includes reason when the submission was rejected", async () => {
      mockDb.where
        .mockResolvedValueOnce([{ id: 4 }])
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce([{ total: 3 }])
      mockDb.orderBy.mockReturnValueOnce(mockDb)
      mockDb.limit.mockReturnValueOnce(mockDb)
      mockDb.offset.mockResolvedValueOnce([
        {
          id: 3,
          quizTitle: "Healthcare compliance quiz",
          createdAt: new Date("2026-07-03T10:00:00.000Z"),
          status: "rejected",
          rejectedNote: "does not apply",
        },
      ])

      const result = await service.findAllQuizTemplatesForAuthor("01HZY3K6X4G8VZJ2E9QWERTY12", 2, 1)

      expect(result).toEqual({
        data: [
          {
            id: "3",
            quizTitle: "Healthcare compliance quiz",
            dateSubmitted: "2026-07-03",
            status: "rejected",
            reason: "does not apply",
          },
        ],
        total: 3,
        page: 2,
        limit: 1,
      })
    })
  })
})
