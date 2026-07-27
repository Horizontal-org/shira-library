import { Module } from "@nestjs/common"
import { QuestionTemplatesController } from "./controllers/question-templates.controller"
import { QuestionTemplatesService } from "./services/question-templates.service"
import { ListQuestionTemplatesService } from "./services/list-question-templates.service"
import { DemoQuestionTemplatesController } from "./controllers/demo-question-templates.controller"
import { DemoQuestionTemplatesService } from "./services/demo-question-templates.service"
import { QuestionTemplatesCommand } from "./question-templates.command"
import { AuthorsModule } from "../authors/authors.module"
import { CreateQuestionTemplatesService } from "./services/create.question-templates.service"
import { TagsModule } from "../tags/tags.module"
import { LangTagsModule } from "../lang-tags/lang-tags.module"
import { PublishQuestionTemplatesService } from "./services/publish-question-templates.service"

@Module({
  imports: [AuthorsModule, TagsModule, LangTagsModule],
  controllers: [DemoQuestionTemplatesController, QuestionTemplatesController],
  providers: [
    QuestionTemplatesService,
    DemoQuestionTemplatesService,
    QuestionTemplatesCommand,
    ListQuestionTemplatesService,
    CreateQuestionTemplatesService,
    PublishQuestionTemplatesService
  ],
  exports: [
    CreateQuestionTemplatesService
  ]
})
export class QuestionTemplatesModule { }
