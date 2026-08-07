import { ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { createHash } from "crypto"
import { ApiKeyGuard } from "../api-key.guard"
import { AuthorsService } from "../../authors/services/authors.service"

describe("ApiKeyGuard", () => {
  let guard: ApiKeyGuard
  let authorsService: { findByApiKeyHash: jest.Mock }

  const buildContext = (headers: Record<string, string>, request: Record<string, unknown> = {}) => {
    const req = { headers, ...request }
    return {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext & { __req: typeof req }
  }

  beforeEach(() => {
    authorsService = { findByApiKeyHash: jest.fn() }
    guard = new ApiKeyGuard(authorsService as unknown as AuthorsService)
  })

  it("throws UnauthorizedException when the Authorization header is missing", async () => {
    const context = buildContext({})

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
    expect(authorsService.findByApiKeyHash).not.toHaveBeenCalled()
  })

  it("throws UnauthorizedException when the header is not a Bearer token", async () => {
    const context = buildContext({ authorization: "Basic abc123" })

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it("throws UnauthorizedException when no author matches the key hash", async () => {
    authorsService.findByApiKeyHash.mockResolvedValueOnce(null)
    const context = buildContext({ authorization: "Bearer slib_deadbeef" })

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it("attaches the resolved author to the request and allows the request through", async () => {
    const author = { id: 4, publicSpaceId: "spc_123" }
    authorsService.findByApiKeyHash.mockResolvedValueOnce(author)
    const request: Record<string, unknown> = { headers: { authorization: "Bearer slib_deadbeef" } }
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext

    const expectedHash = createHash("sha256").update("slib_deadbeef").digest("hex")
    await expect(guard.canActivate(context)).resolves.toBe(true)

    expect(authorsService.findByApiKeyHash).toHaveBeenCalledWith(expectedHash)
    expect(request.author).toBe(author)
  })
})
