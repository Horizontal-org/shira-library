import { BadRequestException } from "@nestjs/common";
import { ImageErrorCodes } from "./errors/image.error-codes";

export class InvalidFileTypeImageException extends BadRequestException {
  constructor() {
    super(ImageErrorCodes.InvalidFileType);
  }
}
