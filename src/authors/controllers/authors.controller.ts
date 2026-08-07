import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { Public } from "../../auth/public.decorator"
import { Roles } from "../../auth/roles.decorator"
import { RolesGuard } from "../../auth/roles.guard"
import { AuthorsService } from "../services/authors.service"
import { RegisterAuthorService } from "../services/register-author.service"
import { ListAuthorSubmissionsService } from "../services/list-author-submissions.service"
import { PaginatedAuthorSubmissionsResponseDto } from "../dto/author-submission-response.dto"
import { PaginatedAuthorQuizSubmissionsResponseDto } from "../dto/author-quiz-submission-response.dto"
import { ListAuthorSubmissionsDto } from "../dto/list-author-submissions.dto"
import { UpdateAuthorDto } from "../dto/update-author.dto"
import { CheckDisplayNameAvailableDto } from "../dto/check-display-name-available.dto"
import { PublishAuthorDto } from "../dto/author-publish.dto"
import { AuthorResponseDto, DisplayNameAvailableResponseDto, RegisterAuthorResponseDto } from "../dto/author-response.dto"

@ApiTags('authors')
@ApiBearerAuth()
@Controller("authors")
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly registerAuthorService: RegisterAuthorService,
    private readonly listAuthorSubmissionsService: ListAuthorSubmissionsService,
  ) { }

  @Post("register")
  @Public()
  @Throttle({ strict: {} })
  @ApiOperation({ summary: "Register a self-hosted space and obtain (or rotate) its shira-library API key" })
  @ApiCreatedResponse({ type: RegisterAuthorResponseDto })
  async register(@Body() body: PublishAuthorDto) {
    return this.registerAuthorService.register(body)
  }

  @Get(":publicSpaceId/question-submissions")
  @Public()
  @ApiOperation({ summary: "List a space's submitted question templates and their review status" })
  @ApiOkResponse({ type: PaginatedAuthorSubmissionsResponseDto })
  async findSubmissions(
    @Param("publicSpaceId") publicSpaceId: string,
    @Query() query: ListAuthorSubmissionsDto,
  ) {
    const { page, limit } = this.parsePagination(query)
    return this.listAuthorSubmissionsService.findAllQuestionTemplatesForAuthor(publicSpaceId, page, limit)
  }

  @Get(":publicSpaceId/quiz-submissions")
  @Public()
  @ApiOperation({ summary: "List a space's submitted quiz templates and their review status" })
  @ApiOkResponse({ type: PaginatedAuthorQuizSubmissionsResponseDto })
  async findQuizSubmissions(
    @Param("publicSpaceId") publicSpaceId: string,
    @Query() query: ListAuthorSubmissionsDto,
  ) {
    const { page, limit } = this.parsePagination(query)
    return this.listAuthorSubmissionsService.findAllQuizTemplatesForAuthor(publicSpaceId, page, limit)
  }

  private parsePagination(query: ListAuthorSubmissionsDto): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20))
    return { page, limit }
  }

  //super-admin routes

  @Get()
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "List all authors" })
  @ApiOkResponse({ type: [AuthorResponseDto] })
  async findAll() {
    return this.authorsService.findAll()
  }

  @Get("display-name-available")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Check whether a space display name is available" })
  @ApiOkResponse({ type: DisplayNameAvailableResponseDto })
  async checkDisplayNameAvailable(@Query() query: CheckDisplayNameAvailableDto) {
    const excludeId = query.excludeId ? parseInt(query.excludeId, 10) : undefined
    const taken = await this.authorsService.isDisplayNameTaken(query.spaceDisplayName, excludeId)
    return { available: !taken }
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Update an author" })
  @ApiOkResponse({ type: AuthorResponseDto })
  async update(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateAuthorDto) {
    return this.authorsService.update(id, body)
  }

  @Patch(":id/revoke-key")
  @UseGuards(RolesGuard)
  @Roles("super-admin")
  @ApiOperation({ summary: "Revoke an author's shira-library API key" })
  @ApiOkResponse({ type: AuthorResponseDto })
  async revokeKey(@Param("id", ParseIntPipe) id: number) {
    return this.authorsService.revokeApiKey(id)
  }
}
