import { Inject, Injectable } from "@nestjs/common"
import { and, asc, count, desc, eq, inArray, like, SQL } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { quizTemplates } from "../../db/schema/quiz-templates"
import { quizLangTags } from "../../db/schema/quiz-lang-tags"
import { quizTags } from "../../db/schema/quiz-tags"
import { langTags } from "../../db/schema/lang-tags"
import { tags } from "../../db/schema/tags"
import * as schema from "../../db/schema"
import { ListQuizTemplatesQuery } from "../dto/list-quiz-templates.dto"

@Injectable()
export class ListQuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll(query: ListQuizTemplatesQuery) {
    const conditions = this.buildConditions(query)
    const where = conditions.length ? and(...conditions) : undefined
    const { page, limit } = query

    const [quizzes, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(quizTemplates)
        .where(where)
        .orderBy(query.sortOrder === 'asc' ? asc(quizTemplates.createdAt) : desc(quizTemplates.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),

      this.db
        .select({ total: count() })
        .from(quizTemplates)
        .where(where),
    ])

    if (quizzes.length === 0) return { data: [], total: Number(total), page, limit }

    const quizIds = quizzes.map((q) => q.id)

    const [langTagRows, tagRows] = await Promise.all([
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
    ])

    const data = quizzes.map((quiz) => ({
      ...quiz,
      langTags: langTagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...lt }) => lt),
      tags: tagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...t }) => t),
    }))

    return { data, total: Number(total), page, limit }
  }

  private buildConditions(query: ListQuizTemplatesQuery): SQL[] {
    const conditions: SQL[] = []

    if (query.search) {
      conditions.push(like(quizTemplates.title, `%${query.search}%`))
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
