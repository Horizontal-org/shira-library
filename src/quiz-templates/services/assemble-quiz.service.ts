import { Inject, Injectable } from "@nestjs/common"
import { sql } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { questionTemplates } from "../../db/schema/question-templates"
import { quizTemplates } from "../../db/schema/quiz-templates"
import { quizQuestions } from "../../db/schema/quiz-questions"
import { langTags } from "../../db/schema/lang-tags"
import { quizLangTags } from "../../db/schema/quiz-lang-tags"
import { tags } from "../../db/schema/tags"
import { quizTags } from "../../db/schema/quiz-tags"

@Injectable()
export class AssembleQuizService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) {}

  async assemble(title: string) {
    const questions = await this.db
      .select()
      .from(questionTemplates)
      .orderBy(sql`RAND()`)
      .limit(10)

    const [{ insertId: quizId }] = await this.db.insert(quizTemplates).values({ title })

    if (questions.length > 0) {
      await this.db.insert(quizQuestions).values(
        questions.map((q) => ({ quizId, questionId: q.id })),
      )
    }

    const [langTag] = await this.db.select().from(langTags).orderBy(sql`RAND()`).limit(1)

    if (langTag) {
      await this.db.insert(quizLangTags).values({ quizId, langTagId: langTag.id })
    }

    const [tag] = await this.db.select().from(tags).orderBy(sql`RAND()`).limit(1)

    if (tag) {
      await this.db.insert(quizTags).values({ quizId, tagId: tag.id })
    }

    return {
      quizId,
      questionCount: questions.length,
      langTag: langTag ?? null,
      tag: tag ?? null,
    }
  }
}
