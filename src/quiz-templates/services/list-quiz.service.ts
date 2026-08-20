import { Inject, Injectable } from "@nestjs/common"
import { and, asc, count, desc, eq, inArray, isNull, like, notInArray, or, sql, SQL } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { quizTemplates } from "../../db/schema/quiz-templates"
import { quizLangTags } from "../../db/schema/quiz-lang-tags"
import { quizTags } from "../../db/schema/quiz-tags"
import { langTags } from "../../db/schema/lang-tags"
import { tags } from "../../db/schema/tags"
import { authors } from "../../db/schema/authors"
import { publishEvents } from "../../db/schema/publish-events"
import * as schema from "../../db/schema"
import { ListQuizTemplatesQuery } from "../dto/list-quiz-templates.dto"
import { PaginatedQuizTemplatesResponseDto } from "../dto/quiz-template-response.dto"

@Injectable()
export class ListQuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findCreators() {
    const [creators, [{ nonAttributedTemplateTotal }]] = await Promise.all([
      this.db
        .select({
          publicSpaceId: authors.publicSpaceId,
          displayName: authors.spaceDisplayName,
        })
        .from(quizTemplates)
        .innerJoin(authors, eq(quizTemplates.authorId, authors.id))
        .where(eq(quizTemplates.approved, true))
        .groupBy(authors.publicSpaceId, authors.spaceDisplayName)
        .orderBy(asc(authors.spaceDisplayName)),
      this.db
        .select({ nonAttributedTemplateTotal: count() })
        .from(quizTemplates)
        .where(and(eq(quizTemplates.approved, true), isNull(quizTemplates.authorId))),
    ])

    if (nonAttributedTemplateTotal > 0) {
      creators.unshift({ publicSpaceId: "none", displayName: "Shira Team" })
    }

    return creators;
  }

  async findAll(query: ListQuizTemplatesQuery): Promise<PaginatedQuizTemplatesResponseDto> {
    const conditions = this.buildConditions(query)
    const where = conditions.length ? and(...conditions) : undefined
    const { page, limit } = query
    const orderBy = this.buildOrderBy(query)

    const [quizzes, [{ total }]] = await Promise.all([
      this.db
        .select({ quiz: quizTemplates, author: authors })
        .from(quizTemplates)
        .leftJoin(authors, eq(quizTemplates.authorId, authors.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset((page - 1) * limit),

      this.db
        .select({ total: count() })
        .from(quizTemplates)
        .where(where),
    ])

    if (quizzes.length === 0) return { data: [], total: Number(total), page, limit }

    const quizIds = quizzes.map(({ quiz }) => quiz.id)

    const [langTagRows, tagRows, submissionRows] = await Promise.all([
      this.db
        .select({
          quizId: quizLangTags.quizId,
          id: langTags.id,
          name: langTags.name,
          code: langTags.code,
        })
        .from(quizLangTags)
        .innerJoin(langTags, eq(quizLangTags.langTagId, langTags.id))
        .where(inArray(quizLangTags.quizId, quizIds)),

      this.db
        .select({
          quizId: quizTags.quizId,
          id: tags.id,
          name: tags.name,
        })
        .from(quizTags)
        .innerJoin(tags, eq(quizTags.tagId, tags.id))
        .where(inArray(quizTags.quizId, quizIds)),

      this.db
        .select({
          resourceId: publishEvents.resourceId,
          status: publishEvents.status,
        })
        .from(publishEvents)
        .where(and(
          eq(publishEvents.resourceType, "quiz_template"),
          inArray(publishEvents.resourceId, quizIds.map(String)),
        ))
        .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id)),
    ])

    const submissionStatusByQuizId = new Map<string, string | null>()
    for (const submission of submissionRows) {
      if (!submissionStatusByQuizId.has(submission.resourceId)) {
        submissionStatusByQuizId.set(submission.resourceId, submission.status)
      }
    }

    const data = quizzes.map(({ quiz, author }) => ({
      ...quiz,
      author: author
        ? {
          publicSpaceId: author.publicSpaceId,
          displayName: author.spaceDisplayName,
        }
        : null,
      langTags: langTagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...lt }) => lt),
      tags: tagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...t }) => t),
      submissionStatus: submissionStatusByQuizId.get(String(quiz.id)) ?? null,
    }))

    return { data, total: Number(total), page, limit }
  }

  private buildOrderBy(query: ListQuizTemplatesQuery): SQL[] {
    const sortDirection = query.sortOrder === 'asc' ? asc : desc
    const isSortingByTitle = query.sortBy === 'title'

    const quizSortByCriteria = isSortingByTitle
      ? sortDirection(quizTemplates.title)
      : sortDirection(quizTemplates.createdAt)

    const quizSortOrder = isSortingByTitle
      ? [desc(quizTemplates.createdAt), desc(quizTemplates.id)]
      : [desc(quizTemplates.id)]

    return [quizSortByCriteria, ...quizSortOrder] as const
  }

  private buildConditions(query: ListQuizTemplatesQuery): SQL[] {
    const conditions: SQL[] = query.filters.status?.length ? [] : [eq(quizTemplates.approved, true)]

    if (query.search) {
      conditions.push(like(quizTemplates.title, `%${query.search}%`))
    }

    if (query.filters.authorPublicSpaceId) {
      conditions.push(
        query.filters.authorPublicSpaceId === "none"
          ? isNull(quizTemplates.authorId)
          : inArray(
            quizTemplates.authorId,
            this.db
              .select({ authorId: authors.id })
              .from(authors)
              .where(eq(authors.publicSpaceId, query.filters.authorPublicSpaceId)),
          ),
      )
    }

    if (query.filters.status?.length) {
      const submissionStatusCondition =
        inArray(
          quizTemplates.id,
          this.db
            .select({ resourceId: sql<number>`CAST(${publishEvents.resourceId} AS UNSIGNED)` })
            .from(publishEvents)
            .where(and(
              eq(publishEvents.resourceType, "quiz_template"),
              inArray(publishEvents.status, query.filters.status),
            )),
        )

      const submissionResourceIds = this.db
        .select({ resourceId: sql<number>`CAST(${publishEvents.resourceId} AS UNSIGNED)` })
        .from(publishEvents)
        .where(eq(publishEvents.resourceType, "quiz_template"))

      conditions.push(
        query.filters.status.includes("accepted")
          ? or(
            and(eq(quizTemplates.approved, true), notInArray(quizTemplates.id, submissionResourceIds)),
            submissionStatusCondition,
          )!
          : submissionStatusCondition,
      )
    }

    if (query.filters.langTags?.length) {
      const codes = query.filters.langTags
      conditions.push(
        inArray(
          quizTemplates.id,
          this.db
            .select({ quizId: quizLangTags.quizId })
            .from(quizLangTags)
            .innerJoin(langTags, eq(quizLangTags.langTagId, langTags.id))
            .where(inArray(langTags.code, codes))
            .groupBy(quizLangTags.quizId),
        ),
      )
    }

    if (query.filters.tags?.length) {
      const slugs = query.filters.tags
      conditions.push(
        inArray(
          quizTemplates.id,
          this.db
            .select({ quizId: quizTags.quizId })
            .from(quizTags)
            .innerJoin(tags, eq(quizTags.tagId, tags.id))
            .where(inArray(tags.slug, slugs))
            .groupBy(quizTags.quizId),
        ),
      )
    }

    return conditions
  }
}
