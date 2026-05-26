import { Inject, Injectable } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../db/drizzle.constants"
import * as schema from "../db/schema"
import { questionTemplates } from "../db/schema/question-templates"
import { langTags } from "../db/schema/lang-tags"
import { questionLangTags } from "../db/schema/question-lang-tags"
import { explanationTemplates } from "../db/schema/explanation-templates"
import { DemoQuestionDto } from "./dto/import-demo-questions.dto"

@Injectable()
export class DemoQuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async importBatch(items: DemoQuestionDto[]) {
    const results = []

    for (const item of items) {
      const [insertResult] = await this.db.insert(questionTemplates).values({
        name: item.name,
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

      const [created] = await this.db
        .select()
        .from(questionTemplates)
        .where(eq(questionTemplates.id, questionId))

      results.push(created)
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
