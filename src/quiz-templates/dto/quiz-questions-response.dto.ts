import { ApiProperty } from "@nestjs/swagger"

export class QuizQuestionExplanationDto {
  @ApiProperty({ example: "top" })
  position: string

  @ApiProperty({ example: "The sender uses urgency to pressure the user." })
  text: string

  @ApiProperty({ example: "1" })
  index: string
}

export class QuizQuestionDto {
  @ApiProperty({ example: 14 })
  questionId: number

  @ApiProperty({ example: "Urgent bank notification" })
  questionName: string

  @ApiProperty({ example: true })
  isPhishing: boolean

  @ApiProperty({ example: "English", nullable: true })
  language: string | null

  @ApiProperty({ example: "Gmail", nullable: true, required: false })
  appName?: string | null

  @ApiProperty({ example: "email" })
  appType: string

  @ApiProperty({ example: "<p>Your account will be locked unless you act now.</p>" })
  content: string

  @ApiProperty({ type: [QuizQuestionExplanationDto] })
  explanations: QuizQuestionExplanationDto[]
}
