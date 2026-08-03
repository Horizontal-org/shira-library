import { IsArray, IsBoolean, IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ExplanationDto } from './explanation.dto'
import { PublishAuthorDto } from '@/authors/dto/author-publish.dto'

export class PublishQuestionTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  description?: string

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

  @IsDefined()
  @ValidateNested()
  @Type(() => PublishAuthorDto)
  author: PublishAuthorDto

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplanationDto)
  explanations?: ExplanationDto[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  templateImageIds?: number[]
}
