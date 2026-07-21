import { Inject, Injectable } from "@nestjs/common"
import { NotFoundQuestionTemplateException } from "../exceptions/not-found.question-template.exception"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionTags } from "../../db/schema/question-tags"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { publishEvents } from "../../db/schema/publish-events"
import { AuthorsService } from "../../authors/services/authors.service"
import { TagsService } from "../../tags/services/tags.service"
import { LangTagsService } from "../../lang-tags/services/lang-tags.service"
import * as schema from "../../db/schema"
import { QuestionTemplateResponseDto } from "../dto/question-template-response.dto"
import { CreateQuestionTemplatesService } from "./create.question-templates.service"
import { PublishQuestionTemplateDto } from "../dto/publish-question-template.dto"

@Injectable()
export class QuestionTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly authorsService: AuthorsService,
    private readonly createQuestionTemplatesService: CreateQuestionTemplatesService,
    private readonly tagsService: TagsService,
    private readonly langTagsService: LangTagsService,
  ) { }

  async findAll(): Promise<QuestionTemplateResponseDto[]> {
    return this.db.select().from(questionTemplates)
  }

  async findOne(id: number): Promise<QuestionTemplateResponseDto> {
    const [result] = await this.db.select().from(questionTemplates).where(eq(questionTemplates.id, id))
    if (!result) throw new NotFoundQuestionTemplateException()
    return result
  }

  async create(data: {
    quizId: number
    name: string
    content: string
    highlighted: boolean
    isPhishing: boolean
    isDemo: boolean
    appType: string
    defaultApp: string
  }): Promise<QuestionTemplateResponseDto> {
    const [result] = await this.db.insert(questionTemplates).values(data)
    return this.findOne(result.insertId)
  }

  async publish(data: PublishQuestionTemplateDto): Promise<void> {
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

    const questionId = await this.createQuestionTemplatesService.create({
      name: data.name,
      content: data.content,
      appType: data.appType,
      defaultApp: data.defaultApp,
      isPhishing: data.isPhishing,
      isDemo: false,
      highlighted: false,
      approved: false,
      authorId: author.id,
      explanations: data.explanations?.map((exp) => ({
        position: exp.position,
        positionIndex: String(exp.index),
        content: exp.content,
      })),
    })

    console.log("🚀 ~ QuestionTemplatesService ~ publish ~ questionId:", questionId)

    if (data.tagIds?.length) {
      await this.db.insert(questionTags).values(
        data.tagIds.map((tagId) => ({ questionId, tagId })),
      )
    }

    if (data.langTagIds?.length) {
      await this.db.insert(questionLangTags).values(
        data.langTagIds.map((langTagId) => ({ questionId, langTagId })),
      )
    }

    await this.db.insert(publishEvents).values({
      resourceType: 'question_template',
      resourceId: String(questionId),
      authorId: author.id,
      status: 'in_review',
    })

    return
  }

  async update(
    id: number,
    data: {
      highlighted?: boolean
      isPhishing?: boolean
      isDemo?: boolean
    },
  ): Promise<QuestionTemplateResponseDto> {
    await this.db.update(questionTemplates).set(data).where(eq(questionTemplates.id, id))
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(questionTemplates).where(eq(questionTemplates.id, id))
  }
}
