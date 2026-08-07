import { Inject, Injectable } from "@nestjs/common"
import { and, eq, isNull, ne } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import { authors } from "../../db/schema/authors"
import * as schema from "../../db/schema"
import { NotFoundAuthorException } from "../exceptions/not-found.author.exception"
import { DisplayNameTakenAuthorException } from "../exceptions/display-name-taken.author.exception"

@Injectable()
export class AuthorsService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  private readonly publicColumns = {
    id: authors.id,
    publicSpaceId: authors.publicSpaceId,
    spaceName: authors.spaceName,
    spaceDisplayName: authors.spaceDisplayName,
    organizationName: authors.organizationName,
    apiKeyPrefix: authors.apiKeyPrefix,
    apiKeyRevokedAt: authors.apiKeyRevokedAt,
    createdAt: authors.createdAt,
  }

  async findAll() {
    return this.db.select(this.publicColumns).from(authors)
  }

  async findOne(id: number) {
    const [result] = await this.db.select(this.publicColumns).from(authors).where(eq(authors.id, id))
    if (!result) throw new NotFoundAuthorException()
    return result
  }

  async findBySpacePublicId(publicSpaceId: string) {
    const [result] = await this.db.select().from(authors).where(eq(authors.publicSpaceId, publicSpaceId))
    return result ?? null
  }

  async isDisplayNameTaken(spaceDisplayName: string, excludeId?: number) {
    const conditions = excludeId !== undefined
      ? and(eq(authors.spaceDisplayName, spaceDisplayName), ne(authors.id, excludeId))
      : eq(authors.spaceDisplayName, spaceDisplayName)

    const result = await this.db.select().from(authors).where(conditions)
    return result.length > 0
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
    await this.findOne(id)
    if (data.spaceDisplayName !== undefined) {
      const taken = await this.isDisplayNameTaken(data.spaceDisplayName, id)
      if (taken) throw new DisplayNameTakenAuthorException()
    }
    await this.db.update(authors).set(data).where(eq(authors.id, id))
    return this.findOne(id)
  }

  async findByApiKeyHash(apiKeyHash: string) {
    const [result] = await this.db
      .select()
      .from(authors)
      .where(and(eq(authors.apiKeyHash, apiKeyHash), isNull(authors.apiKeyRevokedAt)))
    return result ?? null
  }

  async setApiKey(id: number, apiKeyHash: string, apiKeyPrefix: string) {
    await this.db.update(authors).set({ apiKeyHash, apiKeyPrefix, apiKeyRevokedAt: null }).where(eq(authors.id, id))
    return this.findOne(id)
  }

  async revokeApiKey(id: number) {
    await this.findOne(id)
    await this.db.update(authors).set({ apiKeyRevokedAt: new Date() }).where(eq(authors.id, id))
    return this.findOne(id)
  }
}
