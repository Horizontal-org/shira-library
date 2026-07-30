import { Controller, Post, Query, UnprocessableEntityException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../auth/public.decorator";
import { ImagesService } from "../services/images.service";
import { UploadImageResponseDto } from "../dto/upload-image-response.dto";

@ApiTags("question-template-images")
@Controller("question-template-images")
export class ImagesController {
  constructor(private readonly service: ImagesService) { }

  @Post("upload")
  @Public()
  @Throttle({ strict: {} })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOperation({ summary: "Upload an image for a published (or not-yet-published) question template" })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  async upload(
    @UploadedFile("file") file: Express.Multer.File,
    @Query("questionId") questionId?: string,
  ) {
    if (!file) throw new UnprocessableEntityException();
    const parsedQuestionId = questionId ? parseInt(questionId, 10) : undefined;
    return this.service.upload(file, parsedQuestionId);
  }
}
