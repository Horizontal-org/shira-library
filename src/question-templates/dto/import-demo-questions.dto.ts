export class DemoExplanationDto {
  question_id: number
  position: string
  index: number
  content: string
}

export class DemoQuestionDto {
  questionId: number
  name: string
  is_phishing: boolean
  is_demo: boolean
  app_type: string
  default_app: string
  content: string
  lang: { name: string; code: string }
  explanations: DemoExplanationDto[]
}
