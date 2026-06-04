export class CreateQuizTemplateDto {
  title: string
  questionIds: number[]
  tagIds?: number[]
  langTagIds?: number[]
}
