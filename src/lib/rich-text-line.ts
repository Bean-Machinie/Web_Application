function textOf(node: unknown): string {
  if (!node || typeof node !== "object") return ""
  const { text, content } = node as { text?: unknown; content?: unknown }
  if (typeof text === "string") return text
  return Array.isArray(content) ? content.map(textOf).join("") : ""
}

// All the paragraphs of editor JSON as plain text on one line.
export function allText(value: unknown) {
  const blocks = (value as { content?: unknown } | null)?.content
  if (!Array.isArray(blocks)) return ""
  return blocks.map(textOf).map((line) => line.trim()).filter(Boolean).join(" ")
}

// The first non-empty paragraph of editor JSON, as plain text.
export function firstLine(value: unknown) {
  const blocks = (value as { content?: unknown } | null)?.content
  if (!Array.isArray(blocks)) return ""
  for (const block of blocks) {
    const line = textOf(block).trim()
    if (line) return line
  }
  return ""
}
