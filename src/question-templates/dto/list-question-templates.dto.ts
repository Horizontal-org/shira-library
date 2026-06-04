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
  tags?: string      // comma-separated IDs: "1,2"

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
  @IsNumberString()
  page?: string

  @IsOptional()
  @IsNumberString()
  limit?: string
}

export interface QuestionTemplateFilters {
  langTags?: string[]
  tags?: number[]
  appType?: string
  isPhishing?: boolean
}

export interface ListQuestionTemplatesQuery {
  search?: string
  filters: QuestionTemplateFilters
  sortOrder?: 'asc' | 'desc'
  page: number
  limit: number
}
