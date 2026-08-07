import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Author } from "../db/schema/authors"

export const CurrentAuthor = createParamDecorator((_data: unknown, ctx: ExecutionContext): Author => {
  const request = ctx.switchToHttp().getRequest<{ author: Author }>()
  return request.author
})
