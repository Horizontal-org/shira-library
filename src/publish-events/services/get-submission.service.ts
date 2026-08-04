import { Inject, Injectable } from "@nestjs/common"
import { and, desc, eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { authors } from "../../db/schema/authors"
import { publishEvents } from "../../db/schema/publish-events"

@Injectable()
export class GetSubmissionService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findOneByResource(resourceType: "question_template" | "quiz_template", resourceId: number) {
    const [submission] = await this.db
      .select({
        id: publishEvents.id,
        resourceId: publishEvents.resourceId,
        resourceType: publishEvents.resourceType,
        status: publishEvents.status,
        rejectedNote: publishEvents.rejectedNote,
        submittedAt: publishEvents.createdAt,
        authorId: authors.id,
        publicSpaceId: authors.publicSpaceId,
        displayName: authors.spaceDisplayName,
      })
      .from(publishEvents)
      .leftJoin(authors, eq(publishEvents.authorId, authors.id))
      .where(and(
        eq(publishEvents.resourceType, resourceType),
        eq(publishEvents.resourceId, String(resourceId)),
      ))
      .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id))
      .limit(1)

    if (!submission) return null

    return {
      id: String(submission.id),
      resourceId: submission.resourceId,
      resourceType: submission.resourceType,
      status: submission.status ?? "in_review",
      rejectedNote: submission.rejectedNote,
      submittedAt: submission.submittedAt.toISOString(),
      author: submission.authorId === null ? null : {
        id: submission.authorId,
        publicSpaceId: submission.publicSpaceId!,
        displayName: submission.displayName!,
      },
    }
  }
}
