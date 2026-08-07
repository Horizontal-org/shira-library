import { Injectable } from "@nestjs/common"
import { randomBytes, createHash } from "crypto"
import { AuthorsService } from "./authors.service"

const API_KEY_PREFIX = "slib_"

@Injectable()
export class RegisterAuthorService {
  constructor(private readonly authorsService: AuthorsService) { }

  async register(data: {
    publicSpaceId: string
    spaceName: string
    spaceDisplayName: string
    organizationName: string
  }) {
    const author = await this.authorsService.findOrCreate(data)

    const rawKey = `${API_KEY_PREFIX}${randomBytes(32).toString("hex")}`
    const apiKeyHash = createHash("sha256").update(rawKey).digest("hex")
    const apiKeyPrefix = rawKey.slice(0, 12)

    await this.authorsService.setApiKey(author.id, apiKeyHash, apiKeyPrefix)

    return { apiKey: rawKey }
  }
}
