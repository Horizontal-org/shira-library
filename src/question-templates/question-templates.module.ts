import { Module } from "@nestjs/common"
import { QuestionTemplatesController } from "./question-templates.controller"
import { QuestionTemplatesService } from "./question-templates.service"
import { DemoQuestionTemplatesController } from "./demo-question-templates.controller"
import { DemoQuestionTemplatesService } from "./demo-question-templates.service"
import { QuestionTemplatesCommand } from "./question-templates.command"

@Module({
  controllers: [QuestionTemplatesController, DemoQuestionTemplatesController],
  providers: [QuestionTemplatesService, DemoQuestionTemplatesService, QuestionTemplatesCommand],
})
export class QuestionTemplatesModule {}
