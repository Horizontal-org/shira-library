import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ArrayMinSize, MaxLength } from 'class-validator'

export class PublishQuizTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  questionIds: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  langTagIds?: number[]

  @IsString()
  @IsNotEmpty()
  @MaxLength(27)
  publicSpaceId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spaceDisplayName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName: string
}
