import { Inject, Injectable } from "@nestjs/common"
import { NotFoundLangTagException } from "../exceptions/not-found.lang-tag.exception"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { langTags } from "../../db/schema/lang-tags"
import * as schema from "../../db/schema"

@Injectable()
export class LangTagsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll() {
    return this.db.select().from(langTags)
  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(langTags).where(eq(langTags.id, id))
    if (!result) throw new NotFoundLangTagException()
    return result
  }

  async create(data: { name: string; code: string }) {
    const [result] = await this.db.insert(langTags).values(data)
    return this.findOne(result.insertId)
  }

  async remove(id: number) {
    await this.db.delete(langTags).where(eq(langTags.id, id))
  }
}
