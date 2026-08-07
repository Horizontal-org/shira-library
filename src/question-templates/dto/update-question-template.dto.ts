import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateQuestionTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]
}
