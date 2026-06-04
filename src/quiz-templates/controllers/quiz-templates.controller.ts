import {
  BadRequestException,
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
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { ListQuizTemplatesDto } from "../dto/list-quiz-templates.dto"
import { CreateQuizTemplateDto } from "../dto/create-quiz-template.dto"
import { UpdateQuizTemplateDto } from "../dto/update-quiz-template.dto"
import { ListQuizTemplatesService } from "../services/list-quiz.service"
import { Public } from "@/auth/public.decorator"

@Controller("quiz-templates")
export class QuizTemplatesController {
  constructor(
    private readonly service: QuizTemplatesService,
    private readonly listService: ListQuizTemplatesService,
  ) { }

  @Get()
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
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOneEnriched(id)
  }

  @Get(":id/questions")
  async findQuestions(@Param("id", ParseIntPipe) id: number) {
    return this.service.findQuestions(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async create(@Body() body: CreateQuizTemplateDto) {
    if (!body.questionIds?.length) {
      throw new BadRequestException('A quiz must have at least one question')
    }
    return this.service.create(body)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateQuizTemplateDto,
  ) {
    if (body.questionIds !== undefined && !body.questionIds.length) {
      throw new BadRequestException('A quiz must have at least one question')
    }
    return this.service.update(id, body)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id)
    return { deleted: true }
  }
}
