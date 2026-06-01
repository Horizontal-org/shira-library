import { Inject, Injectable, Logger } from "@nestjs/common"
import { eq, inArray } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { quizTemplates } from "../../db/schema/quiz-templates"
import * as schema from "../../db/schema"
import { quizQuestions } from "../../db/schema/quiz-questions"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { langTags } from "../../db/schema/lang-tags"
import { questionTags } from "../../db/schema/question-tags"
import { tags } from "../../db/schema/tags"
import { explanationTemplates } from "../../db/schema/explanation-templates"
import {
  QuizQuestionDto,
  QuizQuestionExplanationDto,
} from "../dto/quiz-questions-response.dto"

@Injectable()
export class QuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  private readonly logger = new Logger(QuizTemplatesService.name)

  async findOne(id: number) {
    const [result] = await this.db.select().from(quizTemplates).where(eq(quizTemplates.id, id))
    return result ?? null
  }

  async findQuestions(id: number): Promise<QuizQuestionDto[] | null> {
    const quiz = await this.findOne(id)

    if (!quiz) {
      return null
    }

    const questionRows = await this.db
      .select({
        quizQuestionId: quizQuestions.id,
        questionId: questionTemplates.id,
        questionName: questionTemplates.name,
        isPhishing: questionTemplates.isPhishing,
        content: questionTemplates.content,
      })
      .from(quizQuestions)
      .innerJoin(questionTemplates, eq(quizQuestions.questionId, questionTemplates.id))
      .where(eq(quizQuestions.quizId, id))

    if (questionRows.length === 0) {
      return []
    }

    const questionIds = questionRows.map((row) => row.questionId)

    this.logger.debug(`${questionIds.length} questions found for quiz ${id}`)

    const [languageRows, tagRows, explanationRows] = await Promise.all([
      this.db
        .select({
          questionId: questionLangTags.questionId,
          language: langTags.name,
        })
        .from(questionLangTags)
        .innerJoin(langTags, eq(questionLangTags.langTagId, langTags.id))
        .where(inArray(questionLangTags.questionId, questionIds)),

      this.db
        .select({
          questionId: questionTags.questionId,
          tagName: tags.name,
        })
        .from(questionTags)
        .innerJoin(tags, eq(questionTags.tagId, tags.id))
        .where(inArray(questionTags.questionId, questionIds)),

      this.db
        .select({
          questionId: explanationTemplates.questionId,
          position: explanationTemplates.position,
          index: explanationTemplates.positionIndex,
          text: explanationTemplates.content,
        })
        .from(explanationTemplates)
        .where(inArray(explanationTemplates.questionId, questionIds)),
    ])

    return questionRows
      .sort((a, b) => (a.quizQuestionId ?? 0) - (b.quizQuestionId ?? 0))
      .map((row) => {
        const languages = languageRows.filter((languageRow) => languageRow.questionId === row.questionId)
        const questionTagsForRow = tagRows.filter((tagRow) => tagRow.questionId === row.questionId)
        const explanations: QuizQuestionExplanationDto[] = explanationRows
          .filter((explanationRow) => explanationRow.questionId === row.questionId)
          .sort((a, b) => String(a.index).localeCompare(String(b.index), undefined, { numeric: true }))
          .map((explanationRow) => ({
            position: explanationRow.position,
            text: explanationRow.text,
            index: explanationRow.index,
          }))

        const question: QuizQuestionDto = {
          questionId: row.questionId,
          questionName: row.questionName,
          isPhishing: row.isPhishing,
          language: languages[0]?.language ?? null,
          app: questionTagsForRow[0]?.tagName ?? null,
          content: row.content,
          explanations,
        }

        return question
      })
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
}
