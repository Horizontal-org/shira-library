import "reflect-metadata"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { PublishQuizTemplateDto } from "./publish-quiz-template.dto"

const author = {
  publicSpaceId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  spaceName: "acme",
  spaceDisplayName: "Acme",
  organizationName: "Acme Corp",
}

const validQuestion = {
  name: "Suspicious SMS",
  content: "<p>content</p>",
  appType: "sms",
  isPhishing: true,
}

describe("PublishQuizTemplateDto", () => {
  it("accepts title, description, and question content within the length caps", async () => {
    const dto = plainToInstance(PublishQuizTemplateDto, {
      title: "a".repeat(150),
      description: "a".repeat(400),
      author,
      questions: [{ ...validQuestion, content: "a".repeat(50000) }],
    })

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it("rejects a title over 150 characters", async () => {
    const dto = plainToInstance(PublishQuizTemplateDto, {
      title: "a".repeat(151),
      description: "A quiz",
      author,
      questions: [validQuestion],
    })

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === "title")).toBe(true)
  })

  it("rejects a description over 400 characters", async () => {
    const dto = plainToInstance(PublishQuizTemplateDto, {
      title: "Phishing basics",
      description: "a".repeat(401),
      author,
      questions: [validQuestion],
    })

    const errors = await validate(dto)
    expect(errors.some((e) => e.property === "description")).toBe(true)
  })

  it("rejects a nested question's content over 50000 characters", async () => {
    const dto = plainToInstance(PublishQuizTemplateDto, {
      title: "Phishing basics",
      description: "A quiz",
      author,
      questions: [{ ...validQuestion, content: "a".repeat(50001) }],
    })

    const errors = await validate(dto)
    const questionErrors = errors.find((e) => e.property === "questions")?.children?.[0]?.children ?? []
    expect(questionErrors.some((e) => e.property === "content")).toBe(true)
  })
})
