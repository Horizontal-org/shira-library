import { Inject, Injectable } from "@nestjs/common"
import { and, count, desc, eq, sql, SQL } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { authors, Author } from "../../db/schema/authors"
import { publishEvents } from "../../db/schema/publish-events"
import { questionTemplates } from "../../db/schema/question-templates"
import { quizTemplates } from "../../db/schema/quiz-templates"
import { NotFoundAuthorException } from "../exceptions/not-found.author.exception"
import { PaginatedAuthorSubmissionsResponseDto } from "../dto/author-submission-response.dto"
import { PaginatedAuthorQuizSubmissionsResponseDto } from "../dto/author-quiz-submission-response.dto"

@Injectable()
export class ListAuthorSubmissionsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAllQuestionTemplatesForAuthor(
    publicSpaceId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedAuthorSubmissionsResponseDto> {
    const author = await this.getAuthorOrThrow(publicSpaceId)

    const where = and(
      eq(publishEvents.authorId, author.id),
      eq(publishEvents.resourceType, "question_template"),
    )

    const [rows, total] = await Promise.all([
      this.db
        .select({
          id: publishEvents.id,
          resourceId: publishEvents.resourceId,
          resourceType: publishEvents.resourceType,
          questionName: questionTemplates.name,
          createdAt: publishEvents.createdAt,
          status: publishEvents.status,
          rejectedNote: publishEvents.rejectedNote,
        })
        .from(publishEvents)
        .innerJoin(
          questionTemplates,
          eq(sql`CAST(${publishEvents.resourceId} AS UNSIGNED)`, questionTemplates.id),
        )
        .where(where)
        .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id))
        .limit(limit)
        .offset((page - 1) * limit),

      this.countSubmissions(where),
    ])

    const data = rows.map((row) => ({
      id: String(row.id),
      resourceId: row.resourceId,
      resourceType: row.resourceType,
      questionName: row.questionName,
      dateSubmitted: row.createdAt.toISOString().slice(0, 10),
      status: row.status as string,
      reason: row.rejectedNote || ''
    }))

    return { data, total, page, limit }
  }

  async findAllQuizTemplatesForAuthor(
    publicSpaceId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedAuthorQuizSubmissionsResponseDto> {
    const author = await this.getAuthorOrThrow(publicSpaceId)

    const where = and(
      eq(publishEvents.authorId, author.id),
      eq(publishEvents.resourceType, "quiz_template"),
    )

    const [rows, total] = await Promise.all([
      this.db
        .select({
          id: publishEvents.id,
          resourceId: publishEvents.resourceId,
          resourceType: publishEvents.resourceType,
          quizTitle: quizTemplates.title,
          createdAt: publishEvents.createdAt,
          status: publishEvents.status,
          rejectedNote: publishEvents.rejectedNote,
        })
        .from(publishEvents)
        .innerJoin(
          quizTemplates,
          eq(sql`CAST(${publishEvents.resourceId} AS UNSIGNED)`, quizTemplates.id),
        )
        .where(where)
        .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id))
        .limit(limit)
        .offset((page - 1) * limit),

      this.countSubmissions(where),
    ])

    const data = rows.map((row) => ({
      id: String(row.id),
      resourceId: row.resourceId,
      resourceType: row.resourceType,
      quizTitle: row.quizTitle,
      dateSubmitted: row.createdAt.toISOString().slice(0, 10),
      status: row.status as string,
      reason: row.rejectedNote || ''
    }))

    return { data, total, page, limit }
  }

  private async getAuthorOrThrow(publicSpaceId: string): Promise<Author> {
    const [author] = await this.db.select().from(authors).where(eq(authors.publicSpaceId, publicSpaceId))
    if (!author) throw new NotFoundAuthorException()
    return author
  }

  private async countSubmissions(where: SQL | undefined): Promise<number> {
    const [{ total }] = await this.db.select({ total: count() }).from(publishEvents).where(where)
    return Number(total)
  }
}
