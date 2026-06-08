import { NotFoundException } from "@nestjs/common"
import { QuizTemplateErrorCodes } from "./errors/quiz-template.error-codes"

export class NotFoundQuizTemplateException extends NotFoundException {
  constructor() {
    super(QuizTemplateErrorCodes.NotFound)
  }
}
