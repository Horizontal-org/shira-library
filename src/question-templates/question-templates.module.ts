import { Module } from "@nestjs/common";
import { QuestionTemplatesController } from "./question-templates.controller";
import { QuestionTemplatesService } from "./question-templates.service";

@Module({
  controllers: [QuestionTemplatesController],
  providers: [QuestionTemplatesService],
})
export class QuestionTemplatesModule {}
