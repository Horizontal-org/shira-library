import {
  applyDecorators,
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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from "@nestjs/swagger"
import { Public } from "../../auth/public.decorator"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import {
  BadRequestErrorResponseDto,
  ForbiddenErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "../../common/dto/error-response.dto"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { ListQuizTemplatesDto } from "../dto/list-quiz-templates.dto"
import { CreateQuizTemplateDto } from "../dto/create-quiz-template.dto"
import { UpdateQuizTemplateDto } from "../dto/update-quiz-template.dto"
import { ListQuizTemplatesService } from "../services/list-quiz.service"
import {
  DeleteQuizTemplateResponseDto,
  PaginatedQuizTemplatesResponseDto,
  QuizTemplateEnrichedResponseDto,
  QuizTemplateResponseDto,
} from "../dto/quiz-template-response.dto"
import { QuizQuestionDto } from "../dto/quiz-questions-response.dto"

function ApiNullableOkArrayResponse(model: typeof QuizQuestionDto) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        nullable: true,
        type: "array",
        items: { $ref: getSchemaPath(model) },
      },
    }),
  )
}

@ApiTags('quiz-templates')
@ApiBearerAuth()
@Controller("quiz-templates")
export class QuizTemplatesController {
  constructor(
    private readonly service: QuizTemplatesService,
    private readonly listService: ListQuizTemplatesService,
  ) { }

  @Get()
  @Public()
  @ApiOperation({ summary: "List quiz templates" })
  @ApiOkResponse({ type: PaginatedQuizTemplatesResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  async findAll(@Query() query: ListQuizTemplatesDto) {
    const results = await this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map(Number).filter(Boolean),
      },
      sortOrder: query.sortOrder ?? 'desc',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })

    return results;
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get a quiz template by id" })
  @ApiOkResponse({ type: QuizTemplateEnrichedResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneEnriched(id)
  }

  @Get(":id/questions")
  @Public()
  @ApiOperation({ summary: "List questions for a quiz template" })
  @ApiNullableOkArrayResponse(QuizQuestionDto)
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  async findQuestions(@Param("id", ParseIntPipe) id: number) {
    return this.service.findQuestions(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Create a quiz template" })
  @ApiCreatedResponse({ type: QuizTemplateResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponseDto })
  async create(@Body() body: CreateQuizTemplateDto) {
    return this.service.create(body)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Update a quiz template" })
  @ApiOkResponse({ type: QuizTemplateEnrichedResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponseDto })
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
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorResponseDto })
  @ApiForbiddenResponse({ type: ForbiddenErrorResponseDto })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id)
    return { deleted: true }
  }
}
