import { ConflictException } from "@nestjs/common"
import { AuthorErrorCodes } from "./errors/author.error-codes"

export class DisplayNameTakenAuthorException extends ConflictException {
  constructor() {
    super(AuthorErrorCodes.DisplayNameTaken)
  }
}
