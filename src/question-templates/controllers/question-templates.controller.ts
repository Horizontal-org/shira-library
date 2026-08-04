import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { Public } from "../../auth/public.decorator"
import { QuestionTemplatesService } from "../services/question-templates.service"
import { ListQuestionTemplatesService } from "../services/list-question-templates.service"
import { ListQuestionTemplatesDto } from "../dto/list-question-templates.dto"
import { UpdateQuestionTemplateDto } from "../dto/update-question-template.dto"
import { PublishQuestionTemplateDto } from "../dto/publish-question-template.dto"
import {
  PaginatedQuestionTemplatesResponseDto,
  QuestionTemplateWithRelationsResponseDto,
} from "../dto/question-template-response.dto"
import { PublishQuestionTemplatesService } from "../services/publish-question-templates.service"

@ApiTags('question-templates')
@ApiBearerAuth()
@Controller("question-templates")
export class QuestionTemplatesController {
  constructor(
    private readonly service: QuestionTemplatesService,
    private readonly listService: ListQuestionTemplatesService,
    private readonly publishService: PublishQuestionTemplatesService
  ) { }

  @Get()
  @Public()
  @ApiOperation({ summary: "List question templates" })
  @ApiOkResponse({ type: PaginatedQuestionTemplatesResponseDto })
  async findAll(@Query() query: ListQuestionTemplatesDto) {
    const isPhishing = query.isPhishing === 'true' ? true : query.isPhishing === 'false' ? false : undefined
    return this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map((s) => s.trim()).filter(Boolean),
        appType: query.appType,
        highlighted: true,
        isPhishing,
      },
      sortOrder: query.sortOrder ?? 'desc',
      sortBy: query.sortBy ?? 'createdAt',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })
  }

  @Get('super')
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Superadmin list question templates" })
  @ApiOkResponse({ type: PaginatedQuestionTemplatesResponseDto })
  async findAllSuper(@Query() query: ListQuestionTemplatesDto) {
    const isPhishing = query.isPhishing === 'true' ? true : query.isPhishing === 'false' ? false : undefined
    return this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map((s) => s.trim()).filter(Boolean),
        appType: query.appType,
        isPhishing,
      },
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get a question template by id" })
  @ApiOkResponse({ type: QuestionTemplateWithRelationsResponseDto })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneEnriched(id, { requireApproved: true })
  }

  @Post("publish")
  @Public()
  @Throttle({ strict: {} })
  @ApiOperation({ summary: "Publish a question template from a shira space" })
  async publish(@Body() body: PublishQuestionTemplateDto) {
    return this.publishService.publish(body)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Update a question template" })
  @ApiOkResponse({ type: QuestionTemplateWithRelationsResponseDto })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateQuestionTemplateDto,
  ) {
    return this.service.update(id, {
      ...(body.description !== undefined && { description: body.description }),
      ...(body.highlighted !== undefined && { highlighted: body.highlighted }),
      ...(body.tagIds !== undefined && { tagIds: body.tagIds }),
      ...(body.langTagIds !== undefined && { langTagIds: body.langTagIds }),
    })
  }
}
