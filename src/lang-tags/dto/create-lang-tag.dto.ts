import { IsNotEmpty, IsString } from 'class-validator'

export class CreateLangTagDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  code: string
}
