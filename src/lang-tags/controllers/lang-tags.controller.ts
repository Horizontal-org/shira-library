import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { Public } from "../../auth/public.decorator"
import { LangTagsService } from "../services/lang-tags.service"
import { CreateLangTagDto } from "../dto/create-lang-tag.dto"

@ApiTags('lang-tags')
@ApiBearerAuth()
@Controller("lang-tags")
export class LangTagsController {
  constructor(private readonly service: LangTagsService) { }

  @Get()
  @Public()
  async findAll() {
    return this.service.findAll()
  }

  @Get(":id")
  @Public()
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id)
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
