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
  Req,
  UseGuards,
} from "@nestjs/common"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { AuthenticatedUser } from "../../auth/jwt.strategy"
import { QuizTemplatesService } from "../services/quiz-templates.service"
import { ListQuizTemplatesDto } from "../dto/list-quiz-templates.dto"
import { ListQuizTemplatesService } from "../services/list-quiz.service"
import { Public } from "@/auth/public.decorator"

@Controller("quiz-templates")
@Public()
export class QuizTemplatesController {
  constructor(
    private readonly service: QuizTemplatesService,
    private readonly listService: ListQuizTemplatesService,
  ) { }

  // @UseGuards(RolesGuard)
  // @Roles("space-admin", "super-admin")
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
    return this.service.findOne(id)
  }

  @Get(":id/questions")
  async findQuestions(@Param("id", ParseIntPipe) id: number) {
    return this.service.findQuestions(id)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id)
    return { deleted: true }
  }
}
