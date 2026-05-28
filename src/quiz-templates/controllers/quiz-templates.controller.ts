import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { AuthenticatedUser } from "../../auth/jwt.strategy"
import { QuizTemplatesService } from "../services/quiz-templates.service"

@Controller("quiz-templates")
export class QuizTemplatesController {
  constructor(private readonly service: QuizTemplatesService) {}

  @Get()
  async findAll() {
    return this.service.findAll()
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async create(
    @Body() body: { title: string; description?: string },
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.service.create({ ...body, createdBy: req.user.userId })
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("space-admin", "super-admin")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { title?: string; description?: string },
  ) {
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
