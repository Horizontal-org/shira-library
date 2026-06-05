import { Inject, Injectable } from "@nestjs/common"
import { NotFoundQuizTemplateException } from "../exceptions/not-found.quiz-template.exception"
import { eq, inArray } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { quizTemplates } from "../../db/schema/quiz-templates"
import * as schema from "../../db/schema"
import { quizQuestions } from "../../db/schema/quiz-questions"
import { quizTags } from "../../db/schema/quiz-tags"
import { quizLangTags } from "../../db/schema/quiz-lang-tags"
import { tags } from "../../db/schema/tags"
import { questionTemplates } from "../../db/schema/question-templates"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { langTags } from "../../db/schema/lang-tags"
import { explanationTemplates } from "../../db/schema/explanation-templates"
import {
  QuizQuestionDto,
  QuizQuestionExplanationDto,
} from "../dto/quiz-questions-response.dto"
import {
  QuizTemplateEnrichedResponseDto,
  QuizTemplateResponseDto,
} from "../dto/quiz-template-response.dto"

@Injectable()
export class QuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findOne(id: number): Promise<QuizTemplateResponseDto> {
    const [result] = await this.db.select().from(quizTemplates).where(eq(quizTemplates.id, id))
    if (!result) throw new NotFoundQuizTemplateException()
    return result
  }

  async findOneEnriched(id: number): Promise<QuizTemplateEnrichedResponseDto> {
    const quiz = await this.findOne(id)

    const [langTagRows, tagRows] = await Promise.all([
      this.db
        .select({ id: langTags.id, name: langTags.name, code: langTags.code })
        .from(quizLangTags)
        .innerJoin(langTags, eq(quizLangTags.langTagId, langTags.id))
        .where(eq(quizLangTags.quizId, id)),
      this.db
        .select({ id: tags.id, name: tags.name })
        .from(quizTags)
        .innerJoin(tags, eq(quizTags.tagId, tags.id))
        .where(eq(quizTags.quizId, id)),
    ])

    return { ...quiz, langTags: langTagRows, tags: tagRows }
  }

  async findQuestions(id: number): Promise<QuizQuestionDto[]> {
    await this.findOne(id)

    const questionRows = await this.db
      .select({
        quizQuestionId: quizQuestions.id,
        questionId: questionTemplates.id,
        questionName: questionTemplates.name,
        isPhishing: questionTemplates.isPhishing,
        defaultApp: questionTemplates.defaultApp,
        appType: questionTemplates.appType,
        content: questionTemplates.content,
      })
      .from(quizQuestions)
      .innerJoin(questionTemplates, eq(quizQuestions.questionId, questionTemplates.id))
      .where(eq(quizQuestions.quizId, id))

    if (questionRows.length === 0) {
      return []
    }

    const questionIds = questionRows.map((row) => row.questionId)

    const [languageRows, explanationRows] = await Promise.all([
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
          appName: row.defaultApp ?? null,
          appType: row.appType,
          content: row.content,
          explanations,
        }

        return question
      })
  }

  async create(data: {
    title: string
    questionIds: number[]
    tagIds?: number[]
    langTagIds?: number[]
  }): Promise<QuizTemplateResponseDto> {
    const [result] = await this.db.insert(quizTemplates).values({ title: data.title })
    const quizId = result.insertId

    await this.db.insert(quizQuestions).values(
      data.questionIds.map(questionId => ({ quizId, questionId }))
    )

    if (data.tagIds?.length) {
      await this.db.insert(quizTags).values(
        data.tagIds.map(tagId => ({ quizId, tagId }))
      )
    }

    if (data.langTagIds?.length) {
      await this.db.insert(quizLangTags).values(
        data.langTagIds.map(langTagId => ({ quizId, langTagId }))
      )
    }

    return this.findOne(quizId)
  }

  async update(id: number, data: {
    title?: string
    questionIds?: number[]
    tagIds?: number[]
    langTagIds?: number[]
  }): Promise<QuizTemplateEnrichedResponseDto> {
    if (data.title !== undefined) {
      await this.db.update(quizTemplates).set({ title: data.title }).where(eq(quizTemplates.id, id))
    }
    if (data.questionIds !== undefined) {
      await this.db.delete(quizQuestions).where(eq(quizQuestions.quizId, id))
      if (data.questionIds.length) {
        await this.db.insert(quizQuestions).values(data.questionIds.map(questionId => ({ quizId: id, questionId })))
      }
    }
    if (data.tagIds !== undefined) {
      await this.db.delete(quizTags).where(eq(quizTags.quizId, id))
      if (data.tagIds.length) {
        await this.db.insert(quizTags).values(data.tagIds.map(tagId => ({ quizId: id, tagId })))
      }
    }
    if (data.langTagIds !== undefined) {
      await this.db.delete(quizLangTags).where(eq(quizLangTags.quizId, id))
      if (data.langTagIds.length) {
        await this.db.insert(quizLangTags).values(data.langTagIds.map(langTagId => ({ quizId: id, langTagId })))
      }
    }
    return this.findOneEnriched(id)
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(quizTemplates).where(eq(quizTemplates.id, id))
  }
}
