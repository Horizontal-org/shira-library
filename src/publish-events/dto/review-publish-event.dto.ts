import { Transform } from "class-transformer"
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class ReviewPublishEventDto {
  @IsIn(["accepted", "rejected"])
  status: "accepted" | "rejected"

    // TODO: Keep for retro compatibility, delete after deploy
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  rejectedNote?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  submissionNote?: string
}
