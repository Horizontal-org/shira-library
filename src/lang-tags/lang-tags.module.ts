import { Module } from "@nestjs/common"
import { LangTagsController } from "./controllers/lang-tags.controller"
import { LangTagsService } from "./services/lang-tags.service"

@Module({
  controllers: [LangTagsController],
  providers: [LangTagsService],
  exports: [LangTagsService],
})
export class LangTagsModule {}
