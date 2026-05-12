import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { QuestionTemplatesService } from "./question-templates.service";

@Controller("quiz-templates/:quizTemplateId/questions")
export class QuestionTemplatesController {
  constructor(private readonly service: QuestionTemplatesService) {}

  @Get()
  async findByQuiz(@Param("quizTemplateId", ParseIntPipe) quizTemplateId: number) {
    return this.service.findByQuiz(quizTemplateId);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async create(
    @Param("quizTemplateId", ParseIntPipe) quizTemplateId: number,
    @Body() body: { question: string; type: string; options?: string; correctAnswer: string; order?: number },
  ) {
    return this.service.create({ ...body, quizTemplateId });
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { question?: string; type?: string; options?: string; correctAnswer?: string; order?: number },
  ) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { deleted: true };
  }
}
