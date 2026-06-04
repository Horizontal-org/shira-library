import { Module } from "@nestjs/common"
import { QuestionTemplatesController } from "./controllers/question-templates.controller"
import { QuestionTemplatesService } from "./services/question-templates.service"
import { ListQuestionTemplatesService } from "./services/list-question-templates.service"
import { DemoQuestionTemplatesController } from "./controllers/demo-question-templates.controller"
import { DemoQuestionTemplatesService } from "./services/demo-question-templates.service"
import { QuestionTemplatesCommand } from "./question-templates.command"

@Module({
  controllers: [DemoQuestionTemplatesController, QuestionTemplatesController],
  providers: [QuestionTemplatesService, DemoQuestionTemplatesService, QuestionTemplatesCommand, ListQuestionTemplatesService],
})
export class QuestionTemplatesModule { }
