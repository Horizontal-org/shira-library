import { Module } from "@nestjs/common"
import { QuizTemplatesController } from "./controllers/quiz-templates.controller"
import { QuizTemplatesService } from "./services/quiz-templates.service"
import { QuizTemplatesCommand } from "./quiz-templates.command"
import { AssembleQuizService } from "./services/assemble-quiz.service"

@Module({
  controllers: [QuizTemplatesController],
  providers: [QuizTemplatesService, QuizTemplatesCommand, AssembleQuizService],
})
export class QuizTemplatesModule {}
