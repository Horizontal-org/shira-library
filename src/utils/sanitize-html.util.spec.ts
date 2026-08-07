import { sanitizeQuestionContent } from "./sanitize-html.util"

describe("sanitizeQuestionContent", () => {
  it("returns an empty string for falsy input", () => {
    expect(sanitizeQuestionContent("")).toBe("")
  })

  it("strips script tags", () => {
    const result = sanitizeQuestionContent('<p>hi</p><script>alert(1)</script>')
    expect(result).toBe("<p>hi</p>")
  })

  it("strips event handler attributes", () => {
    const result = sanitizeQuestionContent('<img src="x" onerror="alert(1)">')
    expect(result).not.toContain("onerror")
    expect(result).toContain('src="x"')
  })

  it("strips javascript: hrefs", () => {
    const result = sanitizeQuestionContent('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain("javascript:")
  })

  it("strips data: hrefs", () => {
    const result = sanitizeQuestionContent('<a href="data:text/html,<script>alert(1)</script>">click</a>')
    expect(result).not.toContain("data:")
  })

  it("forces safe target/rel on anchors", () => {
    const result = sanitizeQuestionContent('<a href="https://example.com">click</a>')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it("preserves legitimate TipTap markup including data-image-id", () => {
    const html = '<p>Question</p><img src="https://example.com/a.png" data-image-id="3" alt="a">'
    const result = sanitizeQuestionContent(html)
    expect(result).toContain("<p>Question</p>")
    expect(result).toContain('data-image-id="3"')
  })

  it("preserves allowed table markup and styles", () => {
    const html = '<table style="border-collapse: collapse;"><tr><td style="color: #ff0000;">cell</td></tr></table>'
    const result = sanitizeQuestionContent(html)
    expect(result).toContain("<table")
    expect(result).toContain("color:#ff0000")
  })

  it("strips disallowed inline styles", () => {
    const html = '<span style="position: fixed; color: #ff0000;">x</span>'
    const result = sanitizeQuestionContent(html)
    expect(result).not.toContain("position")
    expect(result).toContain("color:#ff0000")
  })
})
