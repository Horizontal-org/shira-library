import { BadRequestException, ConflictException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { DRIZZLE } from "../../db/drizzle.constants"
import { NotFoundPublishEventException } from "../exceptions/not-found.publish-event.exception"
import { ReviewPublishEventService } from "../services/review-publish-event.service"

describe("ReviewPublishEventService", () => {
  let service: ReviewPublishEventService

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.update.mockReturnThis()
    mockDb.set.mockReturnThis()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewPublishEventService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<ReviewPublishEventService>(ReviewPublishEventService)
  })

  it("accepts a question submission and persists its optional note", async () => {
    mockDb.where
      .mockResolvedValueOnce([{ id: 5, resourceType: "question_template", resourceId: "12", status: "in_review" }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)

    await expect(service.review(5, { status: "accepted", submissionNote: "Ready for the library" })).resolves.toEqual({
      id: "5",
      status: "accepted",
      rejectedNote: "Ready for the library",
      submissionNote: "Ready for the library",
    })
    expect(mockDb.set).toHaveBeenNthCalledWith(1, { approved: true })
    expect(mockDb.set).toHaveBeenNthCalledWith(2, { status: "accepted", rejectedNote: "Ready for the library" })
  })

  it("rejects a quiz submission and persists its note", async () => {
    mockDb.where
      .mockResolvedValueOnce([{ id: 8, resourceType: "quiz_template", resourceId: "34", status: "in_review" }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)

    await expect(service.review(8, { status: "rejected", submissionNote: "Missing sources" })).resolves.toEqual({
      id: "8",
      status: "rejected",
      rejectedNote: "Missing sources",
      submissionNote: "Missing sources",
    })
    expect(mockDb.set).toHaveBeenNthCalledWith(1, { approved: false })
    expect(mockDb.set).toHaveBeenNthCalledWith(2, { status: "rejected", rejectedNote: "Missing sources" })
  })

  it("throws when the submission does not exist", async () => {
    mockDb.where.mockResolvedValueOnce([])

    await expect(service.review(99, { status: "accepted" })).rejects.toThrow(NotFoundPublishEventException)
  })

  it("rejects unsupported resource types without updating the event", async () => {
    mockDb.where.mockResolvedValueOnce([{ id: 4, resourceType: "image", resourceId: "8", status: "in_review" }])

    await expect(service.review(4, { status: "accepted" })).rejects.toThrow(BadRequestException)
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it("does not allow a reviewed submission to be changed again", async () => {
    mockDb.where.mockResolvedValueOnce([{ id: 7, resourceType: "quiz_template", resourceId: "21", status: "accepted" }])

    await expect(service.review(7, { status: "rejected", submissionNote: "Changed my mind" })).rejects.toThrow(ConflictException)
    expect(mockDb.update).not.toHaveBeenCalled()
  })
})
