import { Inject, Injectable } from "@nestjs/common";
import { PublishQuizTemplateDto } from "../dto/publish-quiz-template.dto";
import { QuizTemplateResponseDto } from "../dto/quiz-template-response.dto";
import { DRIZZLE } from "@/db/drizzle.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { AuthorsService } from "@/authors/services/authors.service";
import { publishEvents, quizTemplates } from "@/db/schema";
import * as schema from "../../db/schema"
import { QuizTemplatesService } from "./quiz-templates.service";
import { CreateQuestionTemplatesService } from "@/question-templates/services/create.question-templates.service";
import { TagsService } from "@/tags/services/tags.service";
import { LangTagsService } from "@/lang-tags/services/lang-tags.service";

@Injectable()
export class PublishQuizTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly authorsService: AuthorsService,
    private readonly quizService: QuizTemplatesService,
    private readonly createQuestionService: CreateQuestionTemplatesService,
    private readonly tagsService: TagsService,
    private readonly langTagsService: LangTagsService,
  ) { }


  async publish(data: PublishQuizTemplateDto): Promise<QuizTemplateResponseDto> {
    await Promise.all([
      this.tagsService.validateIds(data.tagIds ?? []),
      this.langTagsService.validateIds(data.langTagIds ?? []),
    ])

    const author = await this.authorsService.findOrCreate({
      publicSpaceId: data.author.publicSpaceId,
      spaceName: data.author.spaceName,
      spaceDisplayName: data.author.spaceDisplayName,
      organizationName: data.author.organizationName,
    })

    const [result] = await this.db.insert(quizTemplates).values({
      title: data.title.trim(),
      description: data.description.trim(),
      authorId: author.id,
      approved: false,
    })
    const quizId = result.insertId

    const questionIdsToLink = await Promise.all(
      data.questions.map((q) =>
        this.createQuestionService.create({
          name: q.name,
          content: q.content,
          appType: q.appType,
          defaultApp: q.defaultApp,
          isPhishing: q.isPhishing,
          isDemo: false,
          highlighted: false,
          approved: false,
          authorId: author.id,
          explanations: q.explanations?.map((exp) => ({
            position: exp.position,
            positionIndex: String(exp.index),
            content: exp.content,
          })),
        }),
      ),
    )


    console.log("🚀 ~ PublishQuizTemplatesService ~ publish ~ questionIdsToLink:", questionIdsToLink)

    await this.quizService.linkQuizRelations(quizId, {
      questionIds: questionIdsToLink,
      langTagIds: data.langTagIds,
      tagIds: data.tagIds
    })

    await this.db.insert(publishEvents).values({
      resourceType: 'quiz_template',
      resourceId: String(quizId),
      authorId: author.id,
      status: 'in_review',
    })

    return this.quizService.findOne(quizId)
  }
}
