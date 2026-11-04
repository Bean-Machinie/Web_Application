import type { TemplateNode } from "./campaign-template-types"

// What a template's text is written in, a small part of Markdown:
//   ## and ### headings; "- " and "1. " lists; **bold**; a blank line between paragraphs;
//   :::gm ... ::: a GM note; :::read-aloud [when] ... ::: a read aloud block, the text
//   after it being the condition it is read under;
//   @{key} a mention of the template entry with that key.
// Keys are turned into names by `labels`, which is what the chip shows.
export type Labels = Record<string, string>

const INLINE = /\*\*(.+?)\*\*|@\{([a-z0-9-]+)\}/g

function inline(text: string, labels: Labels): TemplateNode[] {
  const nodes: TemplateNode[] = []
  const plain = (value: string, bold = false) => {
    if (value) nodes.push({ type: "text", text: value, ...(bold && { marks: [{ type: "bold" }] }) })
  }
  let last = 0
  for (const found of text.matchAll(INLINE)) {
    plain(text.slice(last, found.index))
    if (found[1] !== undefined) plain(found[1], true)
    else if (labels[found[2]]) nodes.push({ type: "mention", attrs: { id: `tpl:${found[2]}`, label: labels[found[2]] } })
    else plain(found[2])
    last = found.index + found[0].length
  }
  plain(text.slice(last))
  return nodes
}

const paragraph = (text: string, labels: Labels): TemplateNode => ({ type: "paragraph", content: inline(text, labels) })

const BULLET = /^- /
const ORDERED = /^\d+\. /
const special = (line: string) => /^(#{2,3} |:::|- |\d+\. )/.test(line)

function blocks(lines: string[], labels: Labels): TemplateNode[] {
  const out: TemplateNode[] = []
  let at = 0
  while (at < lines.length) {
    const line = lines[at].trim()
    if (!line) {
      at++
      continue
    }
    const fence = line.match(/^:::(read-aloud|gm)\s*(.*)$/)
    if (fence) {
      let end = lines.findIndex((other, place) => place > at && other.trim() === ":::")
      if (end === -1) end = lines.length
      const inner = blocks(lines.slice(at + 1, end), labels)
      out.push(
        fence[1] === "gm"
          ? { type: "gmNote", content: inner }
          : { type: "readAloud", attrs: { condition: fence[2] || null }, content: inner }
      )
      at = end + 1
      continue
    }
    const heading = line.match(/^(#{2,3}) (.+)$/)
    if (heading) {
      out.push({ type: "heading", attrs: { level: heading[1].length }, content: inline(heading[2], labels) })
      at++
      continue
    }
    const marker = BULLET.test(line) ? BULLET : ORDERED.test(line) ? ORDERED : null
    if (marker) {
      const items: TemplateNode[] = []
      while (at < lines.length && marker.test(lines[at].trim())) {
        items.push({ type: "listItem", content: [paragraph(lines[at].trim().replace(marker, ""), labels)] })
        at++
      }
      out.push({ type: marker === BULLET ? "bulletList" : "orderedList", content: items })
      continue
    }
    const text = [line]
    while (at + 1 < lines.length && lines[at + 1].trim() && !special(lines[at + 1].trim())) text.push(lines[++at].trim())
    out.push(paragraph(text.join(" "), labels))
    at++
  }
  return out
}

export const markup = (source: string, labels: Labels): TemplateNode => ({
  type: "doc",
  content: blocks(source.split("\n"), labels),
})
