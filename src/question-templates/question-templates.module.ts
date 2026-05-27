import { Module } from "@nestjs/common"
import { QuestionTemplatesController } from "./question-templates.controller"
import { QuestionTemplatesService } from "./question-templates.service"
import { DemoQuestionTemplatesController } from "./demo-question-templates.controller"
import { DemoQuestionTemplatesService } from "./demo-question-templates.service"

@Module({
  controllers: [QuestionTemplatesController, DemoQuestionTemplatesController],
  providers: [QuestionTemplatesService, DemoQuestionTemplatesService],
})
export class QuestionTemplatesModule {}
