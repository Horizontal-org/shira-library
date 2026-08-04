import { Transform } from "class-transformer"
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator"

export class ReviewPublishEventDto {
  @IsIn(["approved", "rejected"])
  status: "approved" | "rejected"

  @ValidateIf((dto: ReviewPublishEventDto) => dto.status === "rejected")
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  rejectedNote?: string
}
