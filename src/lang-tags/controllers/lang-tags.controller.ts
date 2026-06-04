import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { LangTagsService } from "../services/lang-tags.service"
import { CreateLangTagDto } from "../dto/create-lang-tag.dto"

@ApiTags('lang-tags')
@ApiBearerAuth()
@Controller("lang-tags")
export class LangTagsController {
  constructor(private readonly service: LangTagsService) { }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("super-admin", "space-admin")
  async findAll() {
    return this.service.findAll()
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin", "space-admin")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const langTag = await this.service.findOne(id)
    if (!langTag) throw new NotFoundException()
    return langTag
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async create(@Body() body: CreateLangTagDto) {
    return this.service.create(body)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.service.remove(id)
    return { deleted: true }
  }
}
