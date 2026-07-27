import { Controller, Get, Param, Query } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Public } from "../../auth/public.decorator"
import { ListAuthorSubmissionsService } from "../services/list-author-submissions.service"
import { PaginatedAuthorSubmissionsResponseDto } from "../dto/author-submission-response.dto"
import { ListAuthorSubmissionsDto } from "../dto/list-author-submissions.dto"

@ApiTags('authors')
@Controller("authors")
export class AuthorsController {
  constructor(
    private readonly listAuthorSubmissionsService: ListAuthorSubmissionsService,
  ) { }

  @Get(":publicSpaceId/submissions")
  @Public()
  @ApiOperation({ summary: "List a space's submitted question templates and their review status" })
  @ApiOkResponse({ type: PaginatedAuthorSubmissionsResponseDto })
  async findSubmissions(
    @Param("publicSpaceId") publicSpaceId: string,
    @Query() query: ListAuthorSubmissionsDto,
  ) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20))
    return this.listAuthorSubmissionsService.findAllQuestionTemplatesForAuthor(publicSpaceId, page, limit)
  }
}
