import { IsNumberString, IsOptional, MaxLength } from 'class-validator'

export class ListAuthorSubmissionsDto {
  @IsOptional()
  @IsNumberString()
  @MaxLength(6)
  page?: string

  @IsOptional()
  @IsNumberString()
  @MaxLength(3)
  limit?: string
}
