import { createHash } from "crypto"
import { buildQuestionContentFingerprint } from "./question-content-fingerprint"

describe("buildQuestionContentFingerprint", () => {
  it("hashes sanitized content", () => {
    const result = buildQuestionContentFingerprint('<p>content</p><img src=x onerror=alert(1)>')

    expect(result.sanitizedContent).not.toContain("onerror")
    expect(result.contentHash).toBe(createHash("sha256").update(result.sanitizedContent).digest("hex"))
  })
})
