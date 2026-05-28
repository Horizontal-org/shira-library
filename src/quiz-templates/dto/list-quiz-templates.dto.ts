export class ListQuizTemplatesDto {
  search?: string
  langTags?: string  // comma-separated codes: "en,es"
  tags?: string      // comma-separated IDs: "1,2"
  sortOrder?: 'asc' | 'desc'
}

export interface QuizTemplateFilters {
  langTags?: string[]
  tags?: number[]
}

export interface ListQuizTemplatesQuery {
  search?: string
  filters: QuizTemplateFilters
  sortOrder?: 'asc' | 'desc'
}
