import { ApiProperty } from "@nestjs/swagger";

export class UploadImageResponseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: "question-template-images/2026-07-29T12:00:00.000Z_screenshot.png" })
  relativePath: string;
}
