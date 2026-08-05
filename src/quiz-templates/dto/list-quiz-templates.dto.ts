import { IsIn, IsNumberString, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class ListQuizTemplatesDto {
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
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'

  @IsOptional()
  @IsIn(['createdAt', 'title'])
  sortBy?: 'createdAt' | 'title'

  @IsOptional()
  @Matches(/^(in_review|approved|rejected)(\s*,\s*(in_review|approved|rejected))*$/)
  @MaxLength(50)
  status?: string

  @IsOptional()
  @IsNumberString()
  @MaxLength(6)
  page?: string

  @IsOptional()
  @IsNumberString()
  @MaxLength(3)
  limit?: string
}

export interface QuizTemplateFilters {
  langTags?: string[]
  tags?: string[]
  status?: ('in_review' | 'approved' | 'rejected')[]
}

export interface ListQuizTemplatesQuery {
  search?: string
  filters: QuizTemplateFilters
  sortOrder?: 'asc' | 'desc'
  sortBy?: 'createdAt' | 'title'
  page: number
  limit: number
}
