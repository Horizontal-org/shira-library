import { NotFoundException } from "@nestjs/common"
import { TagErrorCodes } from "./errors/tag.error-codes"

export class NotFoundTagException extends NotFoundException {
  constructor() {
    super(TagErrorCodes.NotFound)
  }
}
