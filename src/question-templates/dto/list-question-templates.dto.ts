export class ListQuestionTemplatesDto {
  search?: string
  langTags?: string  // comma-separated codes: "en,es"
  tags?: string      // comma-separated IDs: "1,2"
  appType?: string
  isPhishing?: string  // "true" | "false"
  sortOrder?: 'asc' | 'desc'
  page?: string
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
