import { Inject, Injectable } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { questionTemplates } from "../../db/schema/question-templates"
import * as schema from "../../db/schema"
import { QuestionTemplateResponseDto } from "../dto/question-template-response.dto"

@Injectable()
export class QuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll(): Promise<QuestionTemplateResponseDto[]> {
    return this.db.select().from(questionTemplates)
  }

  async findOne(id: number): Promise<QuestionTemplateResponseDto | null> {
    const [result] = await this.db.select().from(questionTemplates).where(eq(questionTemplates.id, id))
    return result ?? null
  }

  async create(data: {
    quizId: number
    name: string
    content: string
    highlighted: boolean
    isPhishing: boolean
    isDemo: boolean
    appType: string
    defaultApp: string
  }): Promise<QuestionTemplateResponseDto | null> {
    const [result] = await this.db.insert(questionTemplates).values(data)
    return this.findOne(result.insertId)
  }

  async update(
    id: number,
    data: {
      highlighted?: boolean
      isPhishing?: boolean
      isDemo?: boolean
    },
  ): Promise<QuestionTemplateResponseDto | null> {
    await this.db.update(questionTemplates).set(data).where(eq(questionTemplates.id, id))
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(questionTemplates).where(eq(questionTemplates.id, id))
  }
}
