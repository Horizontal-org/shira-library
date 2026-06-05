import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { QuestionTemplatesService } from "../services/question-templates.service"
import { ListQuestionTemplatesService } from "../services/list-question-templates.service"
import { ListQuestionTemplatesDto } from "../dto/list-question-templates.dto"
import { UpdateQuestionTemplateDto } from "../dto/update-question-template.dto"
import {
  PaginatedQuestionTemplatesResponseDto,
  QuestionTemplateResponseDto,
} from "../dto/question-template-response.dto"

@ApiTags('question-templates')
@ApiBearerAuth()
@Controller("question-templates")
export class QuestionTemplatesController {
  constructor(
    private readonly service: QuestionTemplatesService,
    private readonly listService: ListQuestionTemplatesService
  ) { }

  @Get()
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
        isPhishing,
      },
      sortOrder: query.sortOrder ?? 'desc',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Update a question template" })
  @ApiOkResponse({ type: QuestionTemplateResponseDto })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateQuestionTemplateDto,
  ) {
    return this.service.update(id, { highlighted: body.highlighted })
  }
}
