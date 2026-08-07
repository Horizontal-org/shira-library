import { ConflictException } from "@nestjs/common"
import { QuestionTemplateErrorCodes } from "./errors/question-template.error-codes"

export class DuplicateQuestionTemplateException extends ConflictException {
  constructor() {
    super(QuestionTemplateErrorCodes.DuplicateContent)
  }
}
