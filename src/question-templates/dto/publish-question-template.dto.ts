import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class PublishExplanationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string

  @IsInt()
  index: number

  @IsString()
  @IsNotEmpty()
  content: string
}

export class PublishAuthorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(27)
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

export class PublishQuestionTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  appType: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultApp?: string

  @IsBoolean()
  isPhishing: boolean

  @Type(() => PublishAuthorDto)
  author: PublishAuthorDto

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublishExplanationDto)
  explanations?: PublishExplanationDto[]
}
