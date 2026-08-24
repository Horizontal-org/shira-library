import "reflect-metadata"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { ReviewPublishEventDto } from "./review-publish-event.dto"

describe("ReviewPublishEventDto", () => {
  it("allows accepting a submission without a note", async () => {
    const dto = plainToInstance(ReviewPublishEventDto, { status: "accepted" as const })

    await expect(validate(dto)).resolves.toEqual([])
  })

  it("requires a non-empty note when rejecting a submission", async () => {
    const dto = plainToInstance(ReviewPublishEventDto, { status: "rejected" as const, submissionNote: "   " })

    const errors = await validate(dto)

    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe("submissionNote")
  })

  it("allows an optional non-empty note when accepting a submission", async () => {
    const dto = plainToInstance(ReviewPublishEventDto, {
      status: "accepted" as const,
      submissionNote: "Ready for the library",
    })

    await expect(validate(dto)).resolves.toEqual([])
  })
})
