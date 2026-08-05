import { Inject, Injectable } from "@nestjs/common"
import { NotFoundQuestionTemplateException } from "../exceptions/not-found.question-template.exception"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionTags } from "../../db/schema/question-tags"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { tags } from "../../db/schema/tags"
import { langTags } from "../../db/schema/lang-tags"
import { explanationTemplates } from "../../db/schema/explanation-templates"
import { authors } from "../../db/schema/authors"
import * as schema from "../../db/schema"
import { QuestionTemplateResponseDto, QuestionTemplateWithRelationsResponseDto } from "../dto/question-template-response.dto"
import { ImagesService } from "../../images/services/images.service"

@Injectable()
export class QuestionTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly imagesService: ImagesService,
  ) { }

  async findAll(): Promise<QuestionTemplateResponseDto[]> {
    const rows = await this.db
      .select({ question: questionTemplates, author: authors })
      .from(questionTemplates)
      .leftJoin(authors, eq(questionTemplates.authorId, authors.id))

    return rows.map(({ question, author }) => ({
      ...question,
      author: author
        ? {
          publicSpaceId: author.publicSpaceId,
          displayName: author.spaceDisplayName,
        }
        : null,
    }))
  }

  async findOne(id: number, opts?: { requireApproved?: boolean }): Promise<QuestionTemplateResponseDto> {
    const [result] = await this.db
      .select({ question: questionTemplates, author: authors })
      .from(questionTemplates)
      .leftJoin(authors, eq(questionTemplates.authorId, authors.id))
      .where(eq(questionTemplates.id, id))

    if (!result) throw new NotFoundQuestionTemplateException()

    if (opts?.requireApproved && !result.question.approved) throw new NotFoundQuestionTemplateException()

    return {
      ...result.question,
      author: result.author
        ? {
          publicSpaceId: result.author.publicSpaceId,
          displayName: result.author.spaceDisplayName,
        }
        : null,
    }
  }

  async findOneEnriched(id: number, opts?: { requireApproved?: boolean }): Promise<QuestionTemplateWithRelationsResponseDto> {
    const question = await this.findOne(id, opts)

    const [langTagRows, tagRows, explanationRows, imageRows] = await Promise.all([
      this.db
        .select({ id: langTags.id, name: langTags.name, code: langTags.code })
        .from(questionLangTags)
        .innerJoin(langTags, eq(questionLangTags.langTagId, langTags.id))
        .where(eq(questionLangTags.questionId, id)),
      this.db
        .select({ id: tags.id, name: tags.name })
        .from(questionTags)
        .innerJoin(tags, eq(questionTags.tagId, tags.id))
        .where(eq(questionTags.questionId, id)),
      this.db
        .select({
          id: explanationTemplates.id,
          position: explanationTemplates.position,
          positionIndex: explanationTemplates.positionIndex,
          content: explanationTemplates.content,
          createdAt: explanationTemplates.createdAt,
        })
        .from(explanationTemplates)
        .where(eq(explanationTemplates.questionId, id)),
      this.imagesService.findByQuestionId(id),
    ])

    const images = await Promise.all(
      imageRows.map(async (image) => ({
        id: image.id,
        name: image.name,
        url: await this.imagesService.getPresignedUrl(image.relativePath),
      })),
    )

    return { ...question, langTags: langTagRows, tags: tagRows, explanations: explanationRows, images }
  }

  async update(
    id: number,
    data: {
      description?: string
      highlighted?: boolean
      isPhishing?: boolean
      isDemo?: boolean
      tagIds?: number[]
      langTagIds?: number[]
    },
  ): Promise<QuestionTemplateWithRelationsResponseDto> {
    const { tagIds, langTagIds, ...columns } = data
    if (Object.keys(columns).length > 0) {
      await this.db.update(questionTemplates).set(columns).where(eq(questionTemplates.id, id))
    }

    if (tagIds !== undefined) {
      await this.db.delete(questionTags).where(eq(questionTags.questionId, id))
      if (tagIds.length) {
        await this.db.insert(questionTags).values(tagIds.map(tagId => ({ questionId: id, tagId })))
      }
    }

    if (langTagIds !== undefined) {
      await this.db.delete(questionLangTags).where(eq(questionLangTags.questionId, id))
      if (langTagIds.length) {
        await this.db.insert(questionLangTags).values(langTagIds.map(langTagId => ({ questionId: id, langTagId })))
      }
    }

    return this.findOneEnriched(id)
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(questionTemplates).where(eq(questionTemplates.id, id))
  }
}
