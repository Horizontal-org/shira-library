import { NotFoundException } from "@nestjs/common"
import { LangTagErrorCodes } from "./errors/lang-tag.error-codes"

export class NotFoundLangTagException extends NotFoundException {
  constructor() {
    super(LangTagErrorCodes.NotFound)
  }
}
