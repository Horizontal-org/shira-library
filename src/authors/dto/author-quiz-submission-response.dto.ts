import { ApiProperty } from "@nestjs/swagger"

export class AuthorQuizSubmissionResponseDto {
  @ApiProperty({ example: "1" })
  id: string

  @ApiProperty({ example: "12" })
  resourceId: string

  @ApiProperty({ example: "quiz_template" })
  resourceType: string

  @ApiProperty({ example: "Cybersecurity basics" })
  quizTitle: string

  @ApiProperty({ example: "2026-07-21" })
  dateSubmitted: string

  @ApiProperty({ example: "in_review" })
  status: string

  @ApiProperty({ example: "Great submission", required: false })
  submissionNote?: string
}

export class PaginatedAuthorQuizSubmissionsResponseDto {
  @ApiProperty({ type: [AuthorQuizSubmissionResponseDto] })
  data: AuthorQuizSubmissionResponseDto[]

  @ApiProperty({ example: 42 })
  total: number

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  limit: number
}
