import { Inject, Injectable } from "@nestjs/common"
import { and, count, desc, eq, sql } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { authors } from "../../db/schema/authors"
import { publishEvents } from "../../db/schema/publish-events"
import { questionTemplates } from "../../db/schema/question-templates"
import { NotFoundAuthorException } from "../exceptions/not-found.author.exception"
import { PaginatedAuthorSubmissionsResponseDto } from "../dto/author-submission-response.dto"

@Injectable()
export class ListAuthorSubmissionsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAllQuestionTemplatesForAuthor(
    publicSpaceId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedAuthorSubmissionsResponseDto> {
    const [author] = await this.db.select().from(authors).where(eq(authors.publicSpaceId, publicSpaceId))
    if (!author) throw new NotFoundAuthorException()

    const where = and(
      eq(publishEvents.authorId, author.id),
      eq(publishEvents.resourceType, "question_template"),
    )

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({
          id: publishEvents.id,
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

      this.db
        .select({ total: count() })
        .from(publishEvents)
        .where(where),
    ])

    const data = rows.map((row) => ({
      id: String(row.id),
      questionName: row.questionName,
      dateSubmitted: row.createdAt.toISOString().slice(0, 10),
      status: row.status as string,
      ...(row.rejectedNote ? { reason: row.rejectedNote } : {}),
    }))

    return { data, total: Number(total), page, limit }
  }
}
