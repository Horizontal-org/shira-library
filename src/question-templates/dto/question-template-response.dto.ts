import { ApiProperty } from "@nestjs/swagger"

export class QuestionTemplateTagResponseDto {
  @ApiProperty({ example: 8 })
  id: number

  @ApiProperty({ example: "Mobile" })
  name: string
}

export class QuestionTemplateLangTagResponseDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: "Spanish" })
  name: string

  @ApiProperty({ example: "es" })
  code: string
}

export class QuestionTemplateResponseDto {
  @ApiProperty({ example: 25 })
  id: number

  @ApiProperty({ example: "Suspicious SMS" })
  name: string

  @ApiProperty({ example: "Suspicious text message impersonating a bank.", nullable: true })
  description: string | null

  @ApiProperty({ example: false })
  highlighted: boolean

  @ApiProperty({ example: true })
  isPhishing: boolean

  @ApiProperty({ example: "<p>Please verify your account immediately.</p>" })
  content: string

  @ApiProperty({ example: "email" })
  appType: string

  @ApiProperty({ example: "Outlook", nullable: true })
  defaultApp: string | null

  @ApiProperty({ example: false })
  isDemo: boolean

  @ApiProperty({ example: "2026-06-04T12:00:00.000Z", format: "date-time" })
  createdAt: Date
}

export class ExplanationTemplateResponseDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: "1" })
  position: string

  @ApiProperty({ example: "0" })
  positionIndex: string

  @ApiProperty({ example: "This is a phishing email because..." })
  content: string

  @ApiProperty({ example: "2026-06-04T12:00:00.000Z", format: "date-time" })
  createdAt: Date
}

export class QuestionTemplateWithRelationsResponseDto extends QuestionTemplateResponseDto {
  @ApiProperty({ type: [QuestionTemplateLangTagResponseDto] })
  langTags: QuestionTemplateLangTagResponseDto[]

  @ApiProperty({ type: [QuestionTemplateTagResponseDto] })
  tags: QuestionTemplateTagResponseDto[]

  @ApiProperty({ type: [ExplanationTemplateResponseDto] })
  explanations: ExplanationTemplateResponseDto[]
}

export class PaginatedQuestionTemplatesResponseDto {
  @ApiProperty({ type: [QuestionTemplateWithRelationsResponseDto] })
  data: QuestionTemplateWithRelationsResponseDto[]

  @ApiProperty({ example: 42 })
  total: number

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  limit: number
}
