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
  tags?: string      // comma-separated IDs: "1,2"

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'

  @IsOptional()
  @IsNumberString()
  page?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}

export interface QuizTemplateFilters {
  langTags?: string[]
  tags?: number[]
}

export interface ListQuizTemplatesQuery {
  search?: string
  filters: QuizTemplateFilters
  sortOrder?: 'asc' | 'desc'
  page: number
  limit: number
}
