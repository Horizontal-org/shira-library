export class QuizQuestionExplanationDto {
  position: string
  text: string
  index: string
}

export class QuizQuestionDto {
  questionId: number
  questionName: string
  isPhishing: boolean
  language: string
  app: string
  content: string
  explanations: QuizQuestionExplanationDto[]
}
