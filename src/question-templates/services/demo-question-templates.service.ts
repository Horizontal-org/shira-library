import { Inject, Injectable } from "@nestjs/common"
import { and, eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { questionTemplates } from "../../db/schema/question-templates"
import { langTags } from "../../db/schema/lang-tags"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { explanationTemplates } from "../../db/schema/explanation-templates"
import { DemoQuestionDto } from "../dto/import-demo-questions.dto"

@Injectable()
export class DemoQuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async importBatch(items: DemoQuestionDto[]) {
    const results = {
      created: 0,
      skipped: 0
    }

    const skipped = []

    for (const item of items) {
      const [exists] = await this.db
        .select({ id: questionTemplates.id })
        .from(questionTemplates)
        .innerJoin(questionLangTags, eq(questionLangTags.questionId, questionTemplates.id))
        .innerJoin(langTags, eq(langTags.id, questionLangTags.langTagId))
        .where(and(eq(questionTemplates.name, item.name), eq(langTags.code, item.lang.code)))

      if (exists) {
        results.skipped++
        continue
      }

      const [insertResult] = await this.db.insert(questionTemplates).values({
        name: item.name,
        highlighted: false,
        appType: item.app_type,
        defaultApp: item.default_app,
        content: item.content,
        isPhishing: item.is_phishing,
        isDemo: true,
      })

      const questionId = insertResult.insertId

      const langTagId = await this.resolveOrCreateLangTag(item.lang)

      await this.db.insert(questionLangTags).values({ questionId, langTagId })

      if (item.explanations?.length) {
        await this.db.insert(explanationTemplates).values(
          item.explanations.map((exp) => ({
            questionId,
            position: exp.position,
            positionIndex: String(exp.index),
            content: exp.content,
          })),
        )
      }

      results.created++
    }

    return results
  }

  private async resolveOrCreateLangTag(lang: { name: string; code: string }) {
    const [existing] = await this.db
      .select()
      .from(langTags)
      .where(eq(langTags.code, lang.code))

    if (existing) return existing.id

    const [insertResult] = await this.db.insert(langTags).values({ name: lang.name, code: lang.code })
    return insertResult.insertId
  }
}
