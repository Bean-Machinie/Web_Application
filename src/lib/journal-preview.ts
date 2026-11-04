export type PreviewLine = { text: string; heading: boolean }

// A small look at what a tab holds: a picture if it has one, and a few lines.
export type TabPreview = { image: string | null; lines: PreviewLine[] }

type Node = { type?: string; text?: string; attrs?: { label?: string }; content?: Node[] }

const MAX_LINES = 12

// The words of a node, a mention as the name it was given.
function textOf(node: Node): string {
  if (node.type === "text") return node.text ?? ""
  if (node.type === "mention") return node.attrs?.label ?? ""
  if (node.type === "hardBreak") return " "
  return (node.content ?? []).map(textOf).join("")
}

// A few lines of what a page says, for a small look at it: each block as a line, the
// items of a list one by one, headings marked. Empty for a page with nothing in it.
export function previewLines(content: unknown): PreviewLine[] {
  const lines: PreviewLine[] = []
  const add = (text: string, heading = false) => {
    const trimmed = text.trim()
    if (trimmed && lines.length < MAX_LINES) lines.push({ text: trimmed, heading })
  }

  for (const block of (content as Node | null)?.content ?? []) {
    if (block.type === "bulletList" || block.type === "orderedList") {
      for (const item of block.content ?? []) add(`• ${textOf(item)}`)
    } else {
      add(textOf(block), block.type === "heading")
    }
  }
  return lines
}
