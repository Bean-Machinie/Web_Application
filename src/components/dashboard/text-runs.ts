import type { Node } from "@tiptap/pm/model"

export type TextRun = { text: string; from: number }

// The plain text of a document, one list per paragraph or heading. Code, code blocks and links
// are left out, and a mention (not text) ends a run, so nothing is ever matched inside them.
export function textRunsByBlock(doc: Node): TextRun[][] {
  const blocks: TextRun[][] = []
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true
    if (node.type.spec.code) return false
    const runs: TextRun[] = []
    node.forEach((child, offset) => {
      if (!child.isText || !child.text) return
      if (child.marks.some((mark) => mark.type.name === "code" || mark.type.name === "link")) return
      runs.push({ text: child.text, from: pos + 1 + offset })
    })
    blocks.push(runs)
    return false
  })
  return blocks
}
