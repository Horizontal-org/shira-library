import { Transform } from "class-transformer"
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator"

export class ReviewPublishEventDto {
  @IsIn(["approved", "rejected"])
  status: "approved" | "rejected"

  @ValidateIf((dto: ReviewPublishEventDto) => dto.status !== "rejected" || Boolean(dto.submissionNote))
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  submissionNote?: string
}
