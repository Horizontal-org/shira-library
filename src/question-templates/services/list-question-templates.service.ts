import { Inject, Injectable } from "@nestjs/common"
import { and, asc, count, desc, eq, inArray, like, notInArray, or, sql, SQL } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { questionTags } from "../../db/schema/question-tags"
import { langTags } from "../../db/schema/lang-tags"
import { tags } from "../../db/schema/tags"
import { explanationTemplates } from "../../db/schema/explanation-templates"
import { authors } from "../../db/schema/authors"
import { publishEvents } from "../../db/schema/publish-events"
import * as schema from "../../db/schema"
import { ListQuestionTemplatesQuery } from "../dto/list-question-templates.dto"
import { PaginatedQuestionTemplatesResponseDto } from "../dto/question-template-response.dto"
import { ImagesService } from "../../images/services/images.service"

@Injectable()
export class ListQuestionTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly imagesService: ImagesService,
  ) { }

  async findAll(query: ListQuestionTemplatesQuery): Promise<PaginatedQuestionTemplatesResponseDto> {
    const conditions = this.buildConditions(query)
    const where = conditions.length ? and(...conditions) : undefined
    const { page, limit } = query
    const orderBy = this.buildOrderBy(query)

    const [questions, [{ total }]] = await Promise.all([
      this.db
        .select({ question: questionTemplates, author: authors })
        .from(questionTemplates)
        .leftJoin(authors, eq(questionTemplates.authorId, authors.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset((page - 1) * limit),

      this.db
        .select({ total: count() })
        .from(questionTemplates)
        .where(where),
    ])

    if (questions.length === 0) return { data: [], total: Number(total), page, limit }

    const questionIds = questions.map(({ question }) => question.id)

    const [langTagRows, tagRows, explanationRows, imageRows, submissionRows] = await Promise.all([
      this.db
        .select({
          questionId: questionLangTags.questionId,
          id: langTags.id,
          name: langTags.name,
          code: langTags.code,
        })
        .from(questionLangTags)
        .innerJoin(langTags, eq(questionLangTags.langTagId, langTags.id))
        .where(inArray(questionLangTags.questionId, questionIds)),

      this.db
        .select({
          questionId: questionTags.questionId,
          id: tags.id,
          name: tags.name,
        })
        .from(questionTags)
        .innerJoin(tags, eq(questionTags.tagId, tags.id))
        .where(inArray(questionTags.questionId, questionIds)),

      this.db
        .select({
          questionId: explanationTemplates.questionId,
          id: explanationTemplates.id,
          position: explanationTemplates.position,
          positionIndex: explanationTemplates.positionIndex,
          content: explanationTemplates.content,
          createdAt: explanationTemplates.createdAt,
        })
        .from(explanationTemplates)
        .where(inArray(explanationTemplates.questionId, questionIds)),

      this.imagesService.findByQuestionIds(questionIds),

      this.db
        .select({
          resourceId: publishEvents.resourceId,
          status: publishEvents.status,
        })
        .from(publishEvents)
        .where(and(
          eq(publishEvents.resourceType, "question_template"),
          inArray(publishEvents.resourceId, questionIds.map(String)),
        ))
        .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id)),
    ])

    const submissionStatusByQuestionId = new Map<string, string | null>()
    for (const submission of submissionRows) {
      if (!submissionStatusByQuestionId.has(submission.resourceId)) {
        submissionStatusByQuestionId.set(submission.resourceId, submission.status)
      }
    }

    const data = await Promise.all(questions.map(async ({ question, author }) => ({
      ...question,
      author: author
        ? {
          publicSpaceId: author.publicSpaceId,
          displayName: author.spaceDisplayName,
        }
        : null,
      langTags: langTagRows
        .filter((r) => r.questionId === question.id)
        .map(({ questionId: _, ...lt }) => lt),
      tags: tagRows
        .filter((r) => r.questionId === question.id)
        .map(({ questionId: _, ...t }) => t),
      explanations: explanationRows
        .filter((r) => r.questionId === question.id)
        .map(({ questionId: _, ...e }) => e),
      images: await Promise.all(
        imageRows
          .filter((r) => r.questionId === question.id)
          .map(async (image) => ({
            id: image.id,
            name: image.name,
            url: await this.imagesService.getPresignedUrl(image.relativePath),
          })),
      ),
      submissionStatus: submissionStatusByQuestionId.get(String(question.id)) ?? null,
    })))

    return { data, total: Number(total), page, limit }
  }

  private buildOrderBy(query: ListQuestionTemplatesQuery): SQL[] {
    const sortDirection = query.sortOrder === 'asc' ? asc : desc
    const isSortingByTitle = query.sortBy === 'title'

    const questionSortByCriteria = isSortingByTitle
      ? sortDirection(questionTemplates.name)
      : sortDirection(questionTemplates.createdAt)

    const questionSortOrder = isSortingByTitle
      ? [desc(questionTemplates.createdAt), desc(questionTemplates.id)]
      : [desc(questionTemplates.id)]

    return [questionSortByCriteria, ...questionSortOrder] as const
  }

  private buildConditions(query: ListQuestionTemplatesQuery): SQL[] {
    const conditions: SQL[] = query.filters.status?.length ? [] : [eq(questionTemplates.approved, true)]

    if (query.filters.highlighted !== undefined) {
      conditions.push(eq(questionTemplates.highlighted, query.filters.highlighted))
    }

    if (query.search) {
      conditions.push(like(questionTemplates.name, `%${query.search}%`))
    }

    if (query.filters.appType) {
      conditions.push(eq(questionTemplates.appType, query.filters.appType))
    }

    if (query.filters.isPhishing !== undefined) {
      conditions.push(eq(questionTemplates.isPhishing, query.filters.isPhishing))
    }

    if (query.filters.status?.length) {
      const submissionStatusCondition =
        inArray(
          questionTemplates.id,
          this.db
            .select({ resourceId: sql<number>`CAST(${publishEvents.resourceId} AS UNSIGNED)` })
            .from(publishEvents)
            .where(and(
              eq(publishEvents.resourceType, "question_template"),
              inArray(publishEvents.status, query.filters.status),
            )),
        )

      const submissionResourceIds = this.db
        .select({ resourceId: sql<number>`CAST(${publishEvents.resourceId} AS UNSIGNED)` })
        .from(publishEvents)
        .where(eq(publishEvents.resourceType, "question_template"))

      conditions.push(
        query.filters.status.includes("approved")
          ? or(
            and(eq(questionTemplates.approved, true), notInArray(questionTemplates.id, submissionResourceIds)),
            submissionStatusCondition,
          )!
          : submissionStatusCondition,
      )
    }

    if (query.filters.langTags?.length) {
      const codes = query.filters.langTags
      conditions.push(
        inArray(
          questionTemplates.id,
          this.db
            .select({ questionId: questionLangTags.questionId })
            .from(questionLangTags)
            .innerJoin(langTags, eq(questionLangTags.langTagId, langTags.id))
            .where(inArray(langTags.code, codes))
            .groupBy(questionLangTags.questionId),
        ),
      )
    }

    if (query.filters.tags?.length) {
      const slugs = query.filters.tags
      conditions.push(
        inArray(
          questionTemplates.id,
          this.db
            .select({ questionId: questionTags.questionId })
            .from(questionTags)
            .innerJoin(tags, eq(questionTags.tagId, tags.id))
            .where(inArray(tags.slug, slugs))
            .groupBy(questionTags.questionId),
        ),
      )
    }

    return conditions
  }
}
