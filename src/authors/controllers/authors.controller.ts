import { Controller, Get } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Public } from "../../auth/public.decorator"
import { AuthorsService } from "../services/authors.service"
import { AuthorResponseDto } from "../dto/author-response.dto"

@ApiTags('authors')
@Controller("authors")
export class AuthorsController {
  constructor(private readonly service: AuthorsService) { }

  @Get()
  @Public()
  @ApiOperation({ summary: "List authors (publishing spaces)" })
  @ApiOkResponse({ type: [AuthorResponseDto] })
  async findAll() {
    return this.service.findAll()
  }
}
