import { Controller, Post, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../auth/public.decorator";
import { ApiKeyGuard } from "../../auth/api-key.guard";
import { ImagesService } from "../services/images.service";
import { UploadImageResponseDto } from "../dto/upload-image-response.dto";

@ApiTags("question-template-images")
@ApiBearerAuth()
@Controller("question-template-images")
export class ImagesController {
  constructor(private readonly service: ImagesService) { }

  private static readonly IMAGE_UPLOAD_LIMIT_PER_MINUTE = 30;

  @Post("upload")
  @Public()
  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { limit: ImagesController.IMAGE_UPLOAD_LIMIT_PER_MINUTE, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: "Upload an orphan image, to be linked to a question template via templateImageIds on publish" })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  async upload(@UploadedFile("file") file: Express.Multer.File) {
    if (!file) throw new UnprocessableEntityException();
    return this.service.upload(file);
  }
}
