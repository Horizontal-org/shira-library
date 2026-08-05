import "reflect-metadata"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { PublishQuestionTemplateDto } from "./publish-question-template.dto"

const validBase = {
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
}

describe("PublishQuestionTemplateDto", () => {
  it("accepts content and description within the length caps", async () => {
    const dto = plainToInstance(PublishQuestionTemplateDto, {
      ...validBase,
      description: "a".repeat(400),
      content: "a".repeat(50000),
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it("rejects content over 50000 characters", async () => {
    const dto = plainToInstance(PublishQuestionTemplateDto, {
      ...validBase,
      content: "a".repeat(50001),
    })

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === "content")).toBe(true)
  })

  it("rejects description over 400 characters", async () => {
    const dto = plainToInstance(PublishQuestionTemplateDto, {
      ...validBase,
      description: "a".repeat(401),
    })

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === "description")).toBe(true)
  })
})
