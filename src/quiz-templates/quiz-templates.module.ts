import { Module } from "@nestjs/common"
import { QuizTemplatesController } from "./controllers/quiz-templates.controller"
import { QuizTemplatesService } from "./services/quiz-templates.service"
import { QuizTemplatesCommand } from "./quiz-templates.command"
import { AssembleQuizService } from "./services/assemble-quiz.service"
import { ListQuizTemplatesService } from "./services/list-quiz.service"
import { AuthorsModule } from "../authors/authors.module"
import { PublishQuizTemplatesService } from "./services/publish-quiz.service"
import { QuestionTemplatesModule } from "@/question-templates/question-templates.module"
import { LangTagsModule } from "@/lang-tags/lang-tags.module"
import { TagsModule } from "@/tags/tags.module"

@Module({
  imports: [
    AuthorsModule,
    QuestionTemplatesModule,
    LangTagsModule,
    TagsModule
  ],
  controllers: [QuizTemplatesController],
  providers: [
    QuizTemplatesService,
    QuizTemplatesCommand,
    ListQuizTemplatesService,
    AssembleQuizService,
    PublishQuizTemplatesService
  ],
})
export class QuizTemplatesModule { }
