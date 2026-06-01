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
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { TagsService } from "../services/tags.service"

@Controller("tags")
export class TagsController {
  constructor(private readonly service: TagsService) { }

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
    const tag = await this.service.findOne(id)
    if (!tag) throw new NotFoundException()
    return tag
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async create(@Body() body: { name: string; slug?: string }) {
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
