import { Module } from "@nestjs/common"
import { SubmissionsController } from "./controllers/submissions.controller"
import { ReviewPublishEventService } from "./services/review-publish-event.service"
import { GetSubmissionService } from "./services/get-submission.service"

@Module({
  controllers: [SubmissionsController],
  providers: [ReviewPublishEventService, GetSubmissionService],
  exports: [ReviewPublishEventService, GetSubmissionService],
})
export class PublishEventsModule { }
