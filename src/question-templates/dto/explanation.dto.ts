import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class ExplanationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string

  @IsInt()
  index: number

  @IsString()
  @IsNotEmpty()
  content: string
}
