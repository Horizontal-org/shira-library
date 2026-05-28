import { Inject, Injectable } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { quizTemplates } from "../../db/schema/quiz-templates"
import * as schema from "../../db/schema"

@Injectable()
export class QuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) {}

  async findAll() {
    return this.db.select().from(quizTemplates)
  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(quizTemplates).where(eq(quizTemplates.id, id))
    return result ?? null
  }

  async create(data: { title: string; description?: string; createdBy: string }) {
    const [result] = await this.db.insert(quizTemplates).values(data)
    return this.findOne(result.insertId)
  }

  async update(id: number, data: { title?: string; description?: string }) {
    await this.db.update(quizTemplates).set(data).where(eq(quizTemplates.id, id))
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.db.delete(quizTemplates).where(eq(quizTemplates.id, id))
  }
}
