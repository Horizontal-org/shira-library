import { Controller, Get, Query } from "@nestjs/common"
import { Public } from "@/auth/public.decorator"
import { ListQuestionTemplatesDto } from "../dto/list-question-templates.dto"
import { ListQuestionTemplatesService } from "../services/list-question-templates.service"

@Controller("question-templates")
@Public()
export class ListQuestionsController {
  constructor(private readonly listService: ListQuestionTemplatesService) { }

  @Get()
  async findAll(@Query() query: ListQuestionTemplatesDto) {
    const isPhishing = query.isPhishing === 'true' ? true : query.isPhishing === 'false' ? false : undefined
    return this.listService.findAll({
      search: query.search,
      filters: {
        langTags: query.langTags?.split(',').map((s) => s.trim()).filter(Boolean),
        tags: query.tags?.split(',').map(Number).filter(Boolean),
        appType: query.appType,
        isPhishing,
      },
      sortOrder: query.sortOrder ?? 'desc',
      page: Math.max(1, parseInt(query.page ?? '1', 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10) || 20)),
    })
  }
}
