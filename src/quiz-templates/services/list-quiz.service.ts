import { Inject, Injectable } from "@nestjs/common"
import { and, asc, desc, eq, inArray, like, SQL } from "drizzle-orm"
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

    const quizzes = await this.db
      .select()
      .from(quizTemplates)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(query.sortOrder === 'asc' ? asc(quizTemplates.createdAt) : desc(quizTemplates.createdAt))

    if (quizzes.length === 0) return []

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

    return quizzes.map((quiz) => ({
      ...quiz,
      langTags: langTagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...lt }) => lt),
      tags: tagRows
        .filter((r) => r.quizId === quiz.id)
        .map(({ quizId: _, ...t }) => t),
    }))
  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(quizTemplates).where(eq(quizTemplates.id, id))
    return result ?? null
  }

  async create(data: { title: string; description?: string; createdBy: string }) {
    const [result] = await this.db.insert(quizTemplates).values(data)
    return this.findOne(result.insertId)
  }

  async update(id: number, data: { title?: string; description?: string }) {
    await this.db.update(quizTemplates).set(data).where(eq(quizTemplates.id, id))
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.db.delete(quizTemplates).where(eq(quizTemplates.id, id))
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
      const tagIds = query.filters.tags
      conditions.push(
        inArray(
          quizTemplates.id,
          this.db
            .select({ quizId: quizTags.quizId })
            .from(quizTags)
            .where(inArray(quizTags.tagId, tagIds))
            .groupBy(quizTags.quizId),
        ),
      )
    }

    return conditions
  }
}
