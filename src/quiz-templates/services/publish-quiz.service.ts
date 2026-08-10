import { Inject, Injectable } from "@nestjs/common";
import { PublishQuizTemplateDto } from "../dto/publish-quiz-template.dto";
import { QuizTemplateResponseDto } from "../dto/quiz-template-response.dto";
import { DRIZZLE } from "../../db/drizzle.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { and, eq } from "drizzle-orm";
import { Author } from "../../db/schema/authors";
import { publishEvents, quizTemplates } from "../../db/schema";
import * as schema from "../../db/schema"
import { QuizTemplatesService } from "./quiz-templates.service";
import { TagsService } from "../../tags/services/tags.service";
import { LangTagsService } from "../../lang-tags/services/lang-tags.service";
import { questionTemplates } from "../../db/schema/question-templates";
import { explanationTemplates } from "../../db/schema/explanation-templates";
import { questionTemplateImages } from "../../db/schema/question-template-images";
import { quizQuestions } from "../../db/schema/quiz-questions";
import { quizTags } from "../../db/schema/quiz-tags";
import { quizLangTags } from "../../db/schema/quiz-lang-tags";
import { sanitizeQuestionContent } from "../../utils/sanitize-html.util";
import { buildQuestionContentFingerprint } from "../../question-templates/utils/question-content-fingerprint";

@Injectable()
export class PublishQuizTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly quizService: QuizTemplatesService,
    private readonly tagsService: TagsService,
    private readonly langTagsService: LangTagsService,
  ) { }

  async publish(data: PublishQuizTemplateDto, author: Author): Promise<QuizTemplateResponseDto> {
    await Promise.all([
      this.tagsService.validateIds(data.tagIds ?? []),
      this.langTagsService.validateIds(data.langTagIds ?? []),
    ])

    const quizId = await this.db.transaction(async (tx) => {
      const [result] = await tx.insert(quizTemplates).values({
        title: data.title.trim(),
        description: data.description.trim(),
        authorId: author.id,
        approved: false,
      })
      const quizId = result.insertId

      const questionIds: number[] = []
      for (const question of data.questions) {
        const { sanitizedContent: content, contentHash } = buildQuestionContentFingerprint(question.content)

        const [existing] = await tx
          .select({ id: questionTemplates.id })
          .from(questionTemplates)
          .where(and(
            eq(questionTemplates.authorId, author.id),
            eq(questionTemplates.contentHash, contentHash),
          ))

        if (existing) {
          questionIds.push(existing.id)
          continue
        }

        const [questionResult] = await tx.insert(questionTemplates).values({
          name: question.name,
          content,
          contentHash,
          appType: question.appType,
          defaultApp: question.defaultApp,
          isPhishing: question.isPhishing,
          isDemo: false,
          highlighted: false,
          approved: false,
          authorId: author.id,
        })
        const questionId = questionResult.insertId
        questionIds.push(questionId)

        if (question.explanations?.length) {
          await tx.insert(explanationTemplates).values(question.explanations.map((explanation) => ({
            questionId,
            position: explanation.position,
            positionIndex: String(explanation.index),
            content: sanitizeQuestionContent(explanation.content),
          })))
        }

        const imageIds = [...new Set(question.templateImageIds ?? [])]
        if (imageIds.length) {
          await tx.insert(questionTemplateImages).values(imageIds.map((imageId) => ({ imageId, questionId })))
        }
      }

      await tx.insert(quizQuestions).values([...new Set(questionIds)].map((questionId) => ({ quizId, questionId })))

      if (data.tagIds?.length) {
        await tx.insert(quizTags).values(data.tagIds.map((tagId) => ({ quizId, tagId })))
      }

      if (data.langTagIds?.length) {
        await tx.insert(quizLangTags).values(data.langTagIds.map((langTagId) => ({ quizId, langTagId })))
      }

      await tx.insert(publishEvents).values({
        resourceType: 'quiz_template',
        resourceId: String(quizId),
        authorId: author.id,
        status: 'in_review',
      })

      return quizId
    })

    return this.quizService.findOne(quizId)
  }
}
