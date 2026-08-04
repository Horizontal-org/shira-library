import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { ReviewPublishEventDto } from "../dto/review-publish-event.dto"
import { GetSubmissionService } from "../services/get-submission.service"
import { ReviewPublishEventService } from "../services/review-publish-event.service"

@ApiTags("super")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles("super-admin")
@Controller()
export class SubmissionsController {
  constructor(
    private readonly submissionsService: GetSubmissionService,
    private readonly reviewService: ReviewPublishEventService,
  ) { }

  @Get("question-templates/super/:id/submission")
  @ApiOperation({ summary: "Get a question template submission for review" })
  async findQuestionSubmission(@Param("id", ParseIntPipe) id: number) {
    return this.submissionsService.findOneByResource("question_template", id)
  }

  @Patch("question-templates/super/:id/submission")
  @ApiOperation({ summary: "Approve or reject a question template submission" })
  async reviewQuestionSubmission(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewPublishEventDto,
  ) {
    return this.reviewService.reviewByResource("question_template", id, body)
  }

  @Get("quiz-templates/super/:id/submission")
  @ApiOperation({ summary: "Get a quiz template submission for review" })
  async findQuizSubmission(@Param("id", ParseIntPipe) id: number) {
    return this.submissionsService.findOneByResource("quiz_template", id)
  }

  @Patch("quiz-templates/super/:id/submission")
  @ApiOperation({ summary: "Approve or reject a quiz template submission" })
  async reviewQuizSubmission(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewPublishEventDto,
  ) {
    return this.reviewService.reviewByResource("quiz_template", id, body)
  }
}
