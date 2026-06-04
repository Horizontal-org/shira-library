import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator'

export class CreateQuizTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string

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
