import { ApiProperty } from "@nestjs/swagger"

export class AuthorResponseDto {
  @ApiProperty({ example: 4 })
  id: number

  @ApiProperty({ example: "01HZY3K6X4G8VZJ2E9QWERTY12" })
  publicSpaceId: string

  @ApiProperty({ example: "acme-security-team" })
  spaceName: string

  @ApiProperty({ example: "Acme Security Team" })
  spaceDisplayName: string

  @ApiProperty({ example: "Acme Corp" })
  organizationName: string

  @ApiProperty({ example: "2026-06-04T12:00:00.000Z", format: "date-time" })
  createdAt: Date
}

export class DisplayNameAvailableResponseDto {
  @ApiProperty({ example: true })
  available: boolean
}
