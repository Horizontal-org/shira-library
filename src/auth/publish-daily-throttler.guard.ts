import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { InjectThrottlerStorage, ThrottlerException, ThrottlerStorage } from "@nestjs/throttler"

const TTL = 24 * 60 * 60 * 1000
const LIMIT = 300

@Injectable()
export class PublishDailyThrottlerGuard implements CanActivate {
  constructor(@InjectThrottlerStorage() private readonly storage: ThrottlerStorage) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const key = `publish-daily-${request.ip}`

    const { isBlocked } = await this.storage.increment(key, TTL, LIMIT, TTL, "publish-daily")
    if (isBlocked) throw new ThrottlerException()

    return true
  }
}
