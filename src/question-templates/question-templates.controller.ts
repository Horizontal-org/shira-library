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

@Controller("quiz-templates/:quizId/questions")
export class QuestionTemplatesController {
  constructor(private readonly service: QuestionTemplatesService) {}

  @Get()
  async findByQuiz(@Param("quizId", ParseIntPipe) quizId: number) {
    return this.service.findByQuiz(quizId);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async create(
    @Param("quizId", ParseIntPipe) quizId: number,
    @Body() body: { highlighted?: boolean; isPhishing?: boolean; isDemo?: boolean },
  ) {
    return this.service.create({ ...body, quizId });
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { highlighted?: boolean; isPhishing?: boolean; isDemo?: boolean },
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
