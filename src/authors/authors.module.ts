import { Module } from "@nestjs/common"
import { AuthorsController } from "./controllers/authors.controller"
import { AuthorsService } from "./services/authors.service"

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule { }
