import { IsBoolean } from 'class-validator'

export class UpdateQuestionTemplateDto {
  @IsBoolean()
  highlighted: boolean
}
