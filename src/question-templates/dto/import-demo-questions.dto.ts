import { IsArray, IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class DemoExplanationDto {
  @IsInt()
  question_id: number

  @IsString()
  position: string

  @IsInt()
  index: number

  @IsString()
  content: string
}

class DemoLangDto {
  @IsString()
  name: string

  @IsString()
  code: string
}

export class DemoQuestionDto {
  @IsInt()
  questionId: number

  @IsString()
  name: string

  @IsBoolean()
  is_phishing: boolean

  @IsBoolean()
  is_demo: boolean

  @IsString()
  app_type: string

  @IsString()
  default_app: string

  @IsString()
  content: string

  @ValidateNested()
  @Type(() => DemoLangDto)
  lang: DemoLangDto

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemoExplanationDto)
  explanations: DemoExplanationDto[]
}
