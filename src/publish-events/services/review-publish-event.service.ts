import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common"
import { and, desc, eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { publishEvents } from "../../db/schema/publish-events"
import { questionTemplates } from "../../db/schema/question-templates"
import { quizTemplates } from "../../db/schema/quiz-templates"
import { NotFoundPublishEventException } from "../exceptions/not-found.publish-event.exception"
import { ReviewPublishEventDto } from "../dto/review-publish-event.dto"

@Injectable()
export class ReviewPublishEventService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async review(id: number, data: ReviewPublishEventDto) {
    const [event] = await this.db
      .select()
      .from(publishEvents)
      .where(eq(publishEvents.id, id))

    if (!event) throw new NotFoundPublishEventException()
    if (event.status !== "in_review") {
      throw new ConflictException("Only submissions in review can be accepted or rejected")
    }

    const approved = data.status === "accepted"
    const resourceId = Number(event.resourceId)

    if (event.resourceType === "question_template") {
      await this.db.update(questionTemplates).set({ approved }).where(eq(questionTemplates.id, resourceId))
    } else if (event.resourceType === "quiz_template") {
      await this.db.update(quizTemplates).set({ approved }).where(eq(quizTemplates.id, resourceId))
    } else {
      throw new BadRequestException("Unsupported submission resource type")
    }

    const submissionNote = data.submissionNote?.trim() || null
    await this.db
      .update(publishEvents)
      .set({ status: data.status, submissionNote })
      .where(eq(publishEvents.id, id))

    return { id: String(event.id), status: data.status, submissionNote }
  }

  async reviewByResource(
    resourceType: "question_template" | "quiz_template",
    resourceId: number,
    data: ReviewPublishEventDto,
  ) {
    const [event] = await this.db
      .select({ id: publishEvents.id })
      .from(publishEvents)
      .where(and(
        eq(publishEvents.resourceType, resourceType),
        eq(publishEvents.resourceId, String(resourceId)),
      ))
      .orderBy(desc(publishEvents.createdAt), desc(publishEvents.id))
      .limit(1)

    if (!event) throw new NotFoundPublishEventException()
    return this.review(event.id, data)
  }
}
