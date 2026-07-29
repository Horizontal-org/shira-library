import { NotFoundException } from "@nestjs/common"
import { AuthorErrorCodes } from "./errors/author.error-codes"

export class NotFoundAuthorException extends NotFoundException {
  constructor() {
    super(AuthorErrorCodes.NotFound)
  }
}
