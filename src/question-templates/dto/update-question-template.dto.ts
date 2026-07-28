import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator'

export class UpdateQuestionTemplateDto {
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
