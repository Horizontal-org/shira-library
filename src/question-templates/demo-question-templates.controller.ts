import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { Roles } from "../auth/roles.decorator"
import { RolesGuard } from "../auth/roles.guard"
import { DemoQuestionTemplatesService } from "./demo-question-templates.service"
import { DemoQuestionDto } from "./dto/import-demo-questions.dto"

@Controller("questions/demo")
export class DemoQuestionTemplatesController {
  constructor(private readonly service: DemoQuestionTemplatesService) {}

  @Post("batch")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async importBatch(@Body() body: DemoQuestionDto[]) {
    return this.service.importBatch(body)
  }
}
