import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateQuestionTemplateDto {
  @IsOptional()
  @IsString()
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
