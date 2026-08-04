import { IsIn, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator'

export class ListQuestionTemplatesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  langTags?: string  // comma-separated codes: "en,es"

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string      // comma-separated slugs: "phishing,social-engineering"

  @IsOptional()
  @IsString()
  @MaxLength(50)
  appType?: string

  @IsOptional()
  @IsIn(['true', 'false'])
  isPhishing?: string

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'

  @IsOptional()
  @IsIn(['createdAt', 'title'])
  sortBy?: 'createdAt' | 'title'

  @IsOptional()
  @IsNumberString()
  @MaxLength(6)
  page?: string

  @IsOptional()
  @IsNumberString()
  @MaxLength(3)
  limit?: string
}

export interface QuestionTemplateFilters {
  langTags?: string[]
  tags?: string[]
  appType?: string
  isPhishing?: boolean
  highlighted?: boolean
}

export interface ListQuestionTemplatesQuery {
  search?: string
  filters: QuestionTemplateFilters
  includeUnapproved?: boolean
  sortOrder?: 'asc' | 'desc'
  sortBy?: 'createdAt' | 'title'
  page: number
  limit: number
}
