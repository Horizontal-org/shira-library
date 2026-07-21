import { Inject, Injectable } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { authors } from "../../db/schema/authors"
import * as schema from "../../db/schema"

@Injectable()
export class AuthorsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll() {
    return this.db.select().from(authors)
  }

  async findBySpacePublicId(publicSpaceId: string) {
    const [result] = await this.db.select().from(authors).where(eq(authors.publicSpaceId, publicSpaceId))
    return result ?? null
  }

  async findOrCreate(data: {
    publicSpaceId: string
    spaceName: string
    spaceDisplayName: string
    organizationName: string
  }) {
    const existing = await this.findBySpacePublicId(data.publicSpaceId)
    if (existing) return existing

    const [result] = await this.db.insert(authors).values(data)
    const [created] = await this.db.select().from(authors).where(eq(authors.id, result.insertId))
    return created
  }

  async update(id: number, data: {
    spaceName?: string
    spaceDisplayName?: string
    organizationName?: string
  }) {
    await this.db.update(authors).set(data).where(eq(authors.id, id))
    const [result] = await this.db.select().from(authors).where(eq(authors.id, id))
    return result
  }
}
