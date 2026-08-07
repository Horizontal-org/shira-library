import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { Public } from "../../auth/public.decorator"
import { ApiKeyGuard } from "../../auth/api-key.guard"
import { CurrentAuthor } from "../../auth/current-author.decorator"
import { Author } from "../../db/schema/authors"
import { PublishDailyThrottlerGuard } from "../../auth/publish-daily-throttler.guard"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { ListQuizTemplatesDto } from "../dto/list-quiz-templates.dto"
import { CreateQuizTemplateDto } from "../dto/create-quiz-template.dto"
import { PublishQuizTemplateDto } from "../dto/publish-quiz-template.dto"
import { UpdateQuizTemplateDto } from "../dto/update-quiz-template.dto"
import { ListQuizTemplatesService } from "../services/list-quiz.service"
import { QuizQuestionDto } from "../dto/quiz-questions-response.dto"
import {
  DeleteQuizTemplateResponseDto,
  PaginatedQuizTemplatesResponseDto,
  QuizTemplateEnrichedResponseDto,
  QuizTemplateResponseDto,
} from "../dto/quiz-template-response.dto"
import { PublishQuizTemplatesService } from "../services/publish-quiz.service"

@ApiTags('quiz-templates')
@ApiBearerAuth()
@Controller("quiz-templates")
export class QuizTemplatesController {
  constructor(
    private readonly service: QuizTemplatesService,
    private readonly listService: ListQuizTemplatesService,
    private readonly publishService: PublishQuizTemplatesService
  ) { }

  @Get()
  @Public()
  @ApiOperation({ summary: "List quiz templates" })
  @ApiOkResponse({ type: PaginatedQuizTemplatesResponseDto })
  async findAll(@Query() query: ListQuizTemplatesDto) {
    const results = await this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map((s) => s.trim()).filter(Boolean),
      },
      sortOrder: query.sortOrder ?? 'desc',
      sortBy: query.sortBy ?? 'createdAt',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })

    return results;
  }

  //super-admin routes

  @Get("super")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "List quiz templates" })
  async findAllSuper(@Query() query: ListQuizTemplatesDto) {
    return this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map((s) => s.trim()).filter(Boolean),
        status: query.status?.split(',').map((status) => status.trim()).filter(Boolean) as ('in_review' | 'approved' | 'rejected')[] | undefined,
      },
      sortOrder: query.sortOrder ?? 'desc',
      sortBy: query.sortBy ?? 'createdAt',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })
  }

  @Get("super/:id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Get a quiz template for superadmin review" })
  @ApiOkResponse({ type: QuizTemplateEnrichedResponseDto })
  async findOneSuper(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneEnriched(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Create a quiz template" })
  @ApiCreatedResponse({ type: QuizTemplateResponseDto })
  async create(@Body() body: CreateQuizTemplateDto) {
    return this.service.create(body)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Update a quiz template" })
  @ApiOkResponse({ type: QuizTemplateEnrichedResponseDto })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateQuizTemplateDto,
  ) {
    return this.service.update(id, body)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Delete a quiz template" })
  @ApiOkResponse({ type: DeleteQuizTemplateResponseDto })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id)
    return { deleted: true }
  }

  @Get("super/:id/questions")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "List questions for a quiz template" })
  @ApiOkResponse({ type: [QuizQuestionDto] })
  async findQuestionsSuper(@Param("id", ParseIntPipe) id: number) {
    return this.service.findQuestions(id)
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get a quiz template by id" })
  @ApiOkResponse({ type: QuizTemplateEnrichedResponseDto })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneEnriched(id, { requireApproved: true })
  }

  @Get(":id/questions")
  @Public()
  @ApiOperation({ summary: "List questions for a quiz template" })
  @ApiOkResponse({ type: [QuizQuestionDto] })
  async findQuestions(@Param("id", ParseIntPipe) id: number) {
    return this.service.findQuestions(id, { requireApproved: true })
  }

  @Post("publish")
  @Public()
  @UseGuards(ApiKeyGuard)
  @Throttle({ strict: {} })
  @UseGuards(PublishDailyThrottlerGuard)
  @ApiOperation({ summary: "Publish a quiz template from a shira space" })
  @ApiCreatedResponse({ type: QuizTemplateResponseDto })
  async publish(@Body() body: PublishQuizTemplateDto, @CurrentAuthor() author: Author) {
    return this.publishService.publish(body, author)
  }

}
