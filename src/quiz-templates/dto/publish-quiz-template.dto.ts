import { ExplanationDto } from '@/question-templates/dto/explanation.dto'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize, MaxLength, IsBoolean, ValidateNested } from 'class-validator'

class QuizQuestionTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplanationDto)
  explanations?: ExplanationDto[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  templateImageIds?: number[]
}

export class PublishQuizTemplateDto {
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
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionTemplateDto)
  questions: QuizQuestionTemplateDto[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]
}
