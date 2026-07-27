import { Module } from "@nestjs/common"
import { AuthorsController } from "./controllers/authors.controller"
import { AuthorsService } from "./services/authors.service"
import { ListAuthorSubmissionsService } from "./services/list-author-submissions.service"

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService, ListAuthorSubmissionsService],
  exports: [AuthorsService],
})
export class AuthorsModule { }
