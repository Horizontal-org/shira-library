import { ApiProperty } from "@nestjs/swagger"

export class AuthorSubmissionResponseDto {
  @ApiProperty({ example: "1" })
  id: string

  @ApiProperty({ example: "25" })
  resourceId: string

  @ApiProperty({ example: "Anti-virus marketing" })
  questionName: string

  @ApiProperty({ example: "2026-07-21" })
  dateSubmitted: string

  @ApiProperty({ example: "in_review" })
  status: string

  @ApiProperty({ example: "does not apply", required: false })
  reason?: string
}

export class PaginatedAuthorSubmissionsResponseDto {
  @ApiProperty({ type: [AuthorSubmissionResponseDto] })
  data: AuthorSubmissionResponseDto[]

  @ApiProperty({ example: 42 })
  total: number

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 20 })
  limit: number
}
