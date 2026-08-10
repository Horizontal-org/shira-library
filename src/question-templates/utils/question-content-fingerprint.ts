import { createHash } from "crypto"
import { sanitizeQuestionContent } from "../../utils/sanitize-html.util"

export function buildQuestionContentFingerprint(content: string) {
  const sanitizedContent = sanitizeQuestionContent(content)
  const contentHash = createHash("sha256").update(sanitizedContent).digest("hex")

  return { sanitizedContent, contentHash }
}
