import { Injectable } from "@nestjs/common"
import { Command, Console } from "nestjs-console"
import { QuestionTemplatesService } from "./question-templates.service"

@Console()
@Injectable()
export class QuestionTemplatesCommand {
  constructor(private readonly service: QuestionTemplatesService) {}

  @Command({ command: "list-questions", description: "List all question templates" })
  async listQuestions() {
    const questions = await this.service.findAll()
    console.table(
      questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        content: q.content.slice(0, 60),
        highlighted: q.highlighted,
        isPhishing: q.isPhishing,
        isDemo: q.isDemo,
        createdAt: q.createdAt,
      })),
    )
    process.exit(0)
  }
}
