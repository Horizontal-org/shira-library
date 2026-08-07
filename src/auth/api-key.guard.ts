import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { createHash } from "crypto"
import { AuthorsService } from "../authors/services/authors.service"
import { Author } from "../db/schema/authors"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authorsService: AuthorsService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; author?: Author }>()
    const header = request.headers["authorization"]
    const key = header?.startsWith("Bearer ") ? header.slice(7) : undefined
    if (!key) throw new UnauthorizedException()

    const hash = createHash("sha256").update(key).digest("hex")
    const author = await this.authorsService.findByApiKeyHash(hash)
    if (!author) throw new UnauthorizedException()

    request.author = author
    return true
  }
}
