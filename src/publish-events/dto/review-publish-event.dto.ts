import { Transform } from "class-transformer"
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator"

export class ReviewPublishEventDto {
  @IsIn(["accepted", "rejected"])
  status: "accepted" | "rejected"

  @ValidateIf((dto: ReviewPublishEventDto) => dto.status === "rejected" || dto.submissionNote !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  submissionNote?: string
}
