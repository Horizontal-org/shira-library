import * as sanitizeHtml from "sanitize-html"

// Mirrors shira core's apps/api/src/utils/question-sanitizer.util.ts allowlist
// so TipTap markup (e.g. data-image-id) survives the round trip unchanged.
export function sanitizeQuestionContent(html: string): string {
  if (!html) return ""

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
      "blockquote", "hr", "a", "span", "div", "mark",
      "img",
    ],

    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "data-image-id", "data-original-width", "data-original-height", "data-original-filename", "data-explanation", "data-position"],
      span: ["style", "class", "id", "data-explanation", "data-position"],
      div: ["style", "class", "id", "data-position", "data-attachment-type", "data-explanation"],
      mark: ["data-explanation"],

      table: ["style", "class", "id"],
      thead: ["style", "class"],
      tbody: ["style", "class"],
      tfoot: ["style", "class"],
      tr: ["style", "class"],
      th: ["style", "class", "colspan", "rowspan"],
      td: ["style", "class", "colspan", "rowspan"],
      colgroup: ["style", "class"],
      col: ["style", "class"],

      "*": ["class", "id"],
    },

    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,6}$/i],
        "text-align": [/^(left|right|center|justify)$/],
        "background-color": [/^#[0-9a-f]{3,6}$/i],
        width: [/^\d+px$/, /^\d+%$/, /^auto$/],
        height: [/^\d+px$/, /^\d+%$/, /^auto$/],
        "min-width": [/^\d+px$/],
        "min-height": [/^\d+px$/],
        border: [/^[\d\w\s#(),-]+$/],
        "border-collapse": [/^(collapse|separate)$/],
        padding: [/^\d+px$/],
        margin: [/^\d+px$/],
        "vertical-align": [/^(top|middle|bottom|baseline)$/],
      },
    },

    allowedSchemes: ["http", "https", "mailto"],

    disallowedTagsMode: "discard",

    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href
        if (href && (href.startsWith("javascript:") || href.startsWith("data:"))) {
          delete attribs.href
        }
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        }
      },
    },
  })
}
