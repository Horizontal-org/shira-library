import { Inject, Injectable } from "@nestjs/common"
import { and, asc, count, desc, eq, inArray, like, SQL } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { questionTags } from "../../db/schema/question-tags"
import { langTags } from "../../db/schema/lang-tags"
import { tags } from "../../db/schema/tags"
import * as schema from "../../db/schema"
import { ListQuestionTemplatesQuery } from "../dto/list-question-templates.dto"
import { PaginatedQuestionTemplatesResponseDto } from "../dto/question-template-response.dto"

@Injectable()
export class ListQuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll(query: ListQuestionTemplatesQuery): Promise<PaginatedQuestionTemplatesResponseDto> {
    const conditions = this.buildConditions(query)
    const where = conditions.length ? and(...conditions) : undefined
    const { page, limit } = query
    const orderBy = this.buildOrderBy(query)

    const [questions, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(questionTemplates)
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

    const questionIds = questions.map((q) => q.id)

    const [langTagRows, tagRows] = await Promise.all([
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
    ])

    const data = questions.map((question) => ({
      ...question,
      langTags: langTagRows
        .filter((r) => r.questionId === question.id)
        .map(({ questionId: _, ...lt }) => lt),
      tags: tagRows
        .filter((r) => r.questionId === question.id)
        .map(({ questionId: _, ...t }) => t),
    }))

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
    const conditions: SQL[] = []

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
