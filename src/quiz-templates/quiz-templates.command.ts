import { Injectable } from "@nestjs/common"
import { Command, Console } from "nestjs-console"
import { AssembleQuizService } from "./services/assemble-quiz.service"
import { QuizTemplatesService } from "./services/quiz-templates.service"
import { ListQuizTemplatesService } from "./services/list-quiz.service"

@Console()
@Injectable()
export class QuizTemplatesCommand {
  constructor(
    private readonly service: QuizTemplatesService,
    private readonly listService: ListQuizTemplatesService,
    private readonly assembleQuizService: AssembleQuizService,
  ) { }

  @Command({ command: "list-quizzes", description: "List all quiz templates" })
  async listQuizzes() {
    const quizzes = await this.listService.findAll({ filters: {}, sortOrder: 'desc', page: 1, limit: 100 })
    // console.table(
    //   quizzes.map((q) => ({
    //     id: q.id,
    //     title: q.title,
    //     createdAt: q.createdAt,
    //   })),
    // )
    console.log(quizzes)
    process.exit(0)
  }

  @Command({
    command: "assemble-quiz",
    description: "Create a quiz with 10 random questions and a lang tag",
    options: [
      {
        flags: "-t, --title <title>",
        description: "Title for the new quiz",
        required: true,
      },
    ],
  })
  async assembleQuiz({ title }: { title: string }) {
    const { quizId, questionCount, langTag } = await this.assembleQuizService.assemble(title)

    console.log(`Quiz #${quizId} "${title}" created`)
    console.log(`Questions linked: ${questionCount}`)
    if (langTag) {
      console.log(`Lang tag: ${langTag.name} (${langTag.code})`)
    } else {
      console.warn("No lang tags found — skipping lang tag assignment")
    }
    process.exit(0)
  }
}
