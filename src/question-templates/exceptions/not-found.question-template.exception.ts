import { NotFoundException } from "@nestjs/common"
import { QuestionTemplateErrorCodes } from "./errors/question-template.error-codes"

export class NotFoundQuestionTemplateException extends NotFoundException {
  constructor() {
    super(QuestionTemplateErrorCodes.NotFound)
  }
}
