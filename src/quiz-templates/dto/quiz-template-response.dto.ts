import { ApiProperty } from "@nestjs/swagger"

export class QuizTemplateTagResponseDto {
  @ApiProperty({ example: 3 })
  id: number

  @ApiProperty({ example: "Security" })
  name: string
}

export class QuizTemplateLangTagResponseDto {
  @ApiProperty({ example: 2 })
  id: number

  @ApiProperty({ example: "English" })
  name: string

  @ApiProperty({ example: "en" })
  code: string
}

export class QuizTemplateResponseDto {
  @ApiProperty({ example: 12 })
  id: number

  @ApiProperty({ example: "Banking Safety Basics" })
  title: string

  @ApiProperty({ example: "2026-06-04T12:00:00.000Z", format: "date-time" })
  createdAt: Date
}

export class QuizTemplateEnrichedResponseDto extends QuizTemplateResponseDto {
  @ApiProperty({ type: [QuizTemplateLangTagResponseDto] })
  langTags: QuizTemplateLangTagResponseDto[]

  @ApiProperty({ type: [QuizTemplateTagResponseDto] })
  tags: QuizTemplateTagResponseDto[]
}

export class PaginatedQuizTemplatesResponseDto {
  @ApiProperty({ type: [QuizTemplateEnrichedResponseDto] })
  data: QuizTemplateEnrichedResponseDto[]

  @ApiProperty({ example: 42 })
  total: number

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  limit: number
}

export class DeleteQuizTemplateResponseDto {
  @ApiProperty({ example: true })
  deleted: boolean
}
