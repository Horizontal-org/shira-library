import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize, MaxLength } from 'class-validator'

export class UpdateQuizTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  description?: string

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  questionIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]
}
