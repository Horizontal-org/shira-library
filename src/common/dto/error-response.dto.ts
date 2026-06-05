import { ApiProperty } from "@nestjs/swagger"

export class BadRequestErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number

  @ApiProperty({
    example: ["limit must be a number string", "sortOrder must be one of the following values: asc, desc"],
    type: [String],
  })
  message: string[]

  @ApiProperty({ example: "Bad Request" })
  error: string
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number

  @ApiProperty({ example: "Unauthorized" })
  message: string
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number

  @ApiProperty({ example: "Forbidden resource" })
  message: string

  @ApiProperty({ example: "Forbidden" })
  error: string
}
