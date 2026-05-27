import { Module } from "@nestjs/common";
import { QuizTemplatesController } from "./quiz-templates.controller";
import { QuizTemplatesService } from "./quiz-templates.service";
import { QuizTemplatesCommand } from "./quiz-templates.command";
import { AssembleQuizService } from "./assemble-quiz.service";

@Module({
  controllers: [QuizTemplatesController],
  providers: [QuizTemplatesService, QuizTemplatesCommand, AssembleQuizService],
})
export class QuizTemplatesModule {}
