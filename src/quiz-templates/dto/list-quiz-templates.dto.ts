import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator'

export class ListQuizTemplatesDto {
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

export interface QuizTemplateFilters {
  langTags?: string[]
  tags?: string[]
}

export interface ListQuizTemplatesQuery {
  search?: string
  filters: QuizTemplateFilters
  sortOrder?: 'asc' | 'desc'
  sortBy?: 'createdAt' | 'title'
  page: number
  limit: number
}
