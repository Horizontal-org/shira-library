export class QuizQuestionExplanationDto {
  position: string
  text: string
  index: string
}

export class QuizQuestionDto {
  questionId: number
  questionName: string
  isPhishing: boolean
  language: string | null
  app: string | null
  content: string
  explanations: QuizQuestionExplanationDto[]
}
