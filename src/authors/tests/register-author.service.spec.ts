import { Test, TestingModule } from "@nestjs/testing"
import { createHash } from "crypto"
import { RegisterAuthorService } from "../services/register-author.service"
import { AuthorsService } from "../services/authors.service"

describe("RegisterAuthorService", () => {
  let service: RegisterAuthorService

  const mockAuthorsService = {
    findOrCreate: jest.fn(),
    setApiKey: jest.fn(),
  }

  const data = {
    publicSpaceId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    spaceName: "acme",
    spaceDisplayName: "Acme",
    organizationName: "Acme Corp",
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAuthorService,
        { provide: AuthorsService, useValue: mockAuthorsService },
      ],
    }).compile()

    service = module.get<RegisterAuthorService>(RegisterAuthorService)
  })

  it("upserts the author, issues a prefixed key, and stores only its hash", async () => {
    mockAuthorsService.findOrCreate.mockResolvedValueOnce({ id: 4, ...data })

    const result = await service.register(data)

    expect(mockAuthorsService.findOrCreate).toHaveBeenCalledWith(data)
    expect(result.apiKey).toMatch(/^slib_[0-9a-f]{64}$/)

    const expectedHash = createHash("sha256").update(result.apiKey).digest("hex")
    expect(mockAuthorsService.setApiKey).toHaveBeenCalledWith(4, expectedHash, result.apiKey.slice(0, 12))
  })

  it("rotates the key on re-registration of an existing space", async () => {
    mockAuthorsService.findOrCreate.mockResolvedValue({ id: 4, ...data })

    const first = await service.register(data)
    const second = await service.register(data)

    expect(first.apiKey).not.toEqual(second.apiKey)
    expect(mockAuthorsService.setApiKey).toHaveBeenCalledTimes(2)
  })
})
