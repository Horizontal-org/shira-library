import { NotFoundException } from "@nestjs/common"

export class NotFoundPublishEventException extends NotFoundException {
  constructor() {
    super("Publish event not found")
  }
}
