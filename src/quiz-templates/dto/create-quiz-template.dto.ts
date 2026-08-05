import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize, MaxLength } from 'class-validator'

export class CreateQuizTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  description: string

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  questionIds: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]
}
