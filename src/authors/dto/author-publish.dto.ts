import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class PublishAuthorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(31)
  publicSpaceId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceDisplayName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName: string
}