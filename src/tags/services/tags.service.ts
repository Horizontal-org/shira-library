import { Inject, Injectable } from "@nestjs/common"
import { NotFoundTagException } from "../exceptions/not-found.tag.exception"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { tags } from "../../db/schema/tags"
import * as schema from "../../db/schema"

@Injectable()
export class TagsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll() {
    return this.db.select().from(tags)
  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(tags).where(eq(tags.id, id))
    if (!result) throw new NotFoundTagException()
    return result
  }

  async create(data: { name: string; slug?: string }) {
    const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-")
    const [result] = await this.db.insert(tags).values({ name: data.name, slug })
    return this.findOne(result.insertId)
  }

  async remove(id: number) {
    await this.db.delete(tags).where(eq(tags.id, id))
  }
}
