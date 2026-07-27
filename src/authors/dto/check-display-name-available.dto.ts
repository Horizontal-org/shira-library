import { IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength } from "class-validator"

export class CheckDisplayNameAvailableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceDisplayName: string

  @IsOptional()
  @IsNumberString()
  excludeId?: string
}
