import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class UpdateAuthorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceName?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceDisplayName?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName?: string
}
