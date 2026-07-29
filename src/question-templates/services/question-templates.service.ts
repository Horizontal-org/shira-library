import { Inject, Injectable } from "@nestjs/common"
import { NotFoundQuestionTemplateException } from "../exceptions/not-found.question-template.exception"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import * as schema from "../../db/schema"
import { QuestionTemplateResponseDto } from "../dto/question-template-response.dto"

@Injectable()
export class QuestionTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
  ) { }

  async findAll(): Promise<QuestionTemplateResponseDto[]> {
    return this.db.select().from(questionTemplates)
  }

  async findOne(id: number): Promise<QuestionTemplateResponseDto> {
    const [result] = await this.db.select().from(questionTemplates).where(eq(questionTemplates.id, id))
    if (!result) throw new NotFoundQuestionTemplateException()
    return result
  }

  async update(
    id: number,
    data: {
      highlighted?: boolean
      isPhishing?: boolean
      isDemo?: boolean
    },
  ): Promise<QuestionTemplateResponseDto> {
    await this.db.update(questionTemplates).set(data).where(eq(questionTemplates.id, id))
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(questionTemplates).where(eq(questionTemplates.id, id))
  }
}
