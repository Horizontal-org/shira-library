import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator'

export class ListQuestionTemplatesDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  langTags?: string  // comma-separated codes: "en,es"

  @IsOptional()
  @IsString()
  tags?: string      // comma-separated slugs: "phishing,social-engineering"

  @IsOptional()
  @IsString()
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
  page?: string

  @IsOptional()
  @IsNumberString()
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
  sortOrder?: 'asc' | 'desc'
  sortBy?: 'createdAt' | 'title'
  page: number
  limit: number
}
