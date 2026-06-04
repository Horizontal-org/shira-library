import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { DemoQuestionTemplatesService } from "../services/demo-question-templates.service"
import { DemoQuestionDto } from "../dto/import-demo-questions.dto"

@ApiTags('question-templates')
@ApiBearerAuth()
@Controller("questions/demo")
export class DemoQuestionTemplatesController {
  constructor(private readonly service: DemoQuestionTemplatesService) { }

  @Post("batch")
  @ApiBody({ type: [DemoQuestionDto] })
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  async importBatch(@Body() body: DemoQuestionDto[]) {
    //todo idea for self-hosted protection. add passphrase validation (a static .env secret comparison)
    return this.service.importBatch(body)
  }
}
