import data from "@/data/srd-rules-reference.json"
import { srdNodeId } from "./srd-paths"
import type { RuleBlock, RuleCategory, RuleEffect, RuleEntry } from "./srd-rules-types"

export const RULE_CATEGORIES = data.categories as RuleCategory[]
export const RULE_ENTRIES = data.entries as unknown as RuleEntry[]

const BY_ID = new Map(RULE_ENTRIES.map((entry) => [entry.id, entry]))

export const categoryTitle = (id: string) => RULE_CATEGORIES.find((category) => category.id === id)?.title ?? ""

export const ruleEntry = (id: string | undefined) => (id ? BY_ID.get(id) : undefined)

// Rules have no page of their own: they are read in the compendium, in the panel beside the list of
// rules. `find` is a word to light up in the rule once it opens, as a search for it asks.
export const rulesPath = (termId?: string, find?: string) => {
  const params = new URLSearchParams({ section: srdNodeId("rules") })
  if (termId) params.set("item", termId)
  if (termId && find?.trim()) params.set("find", find.trim())
  return `/app/compendium?${params}`
}

const effectText = (effect: RuleEffect): string[] => [effect.label, effect.text, ...(effect.example ? [effect.example] : []), ...(effect.bullets ?? []), ...(effect.items ?? []).flatMap(effectText)]

function blockText(block: RuleBlock): string[] {
  switch (block.type) {
    case "text":
    case "example":
      return [block.text]
    case "effects":
      return block.items.flatMap(effectText)
    case "table":
      return [block.caption, ...block.rows.flat()]
    case "usedBy":
      return block.items.map((item) => item.text)
    case "bullets":
      return block.items
    case "links":
      return []
  }
}

// Everything an entry says, in lower case, for the search.
const SEARCHABLE = new Map(
  RULE_ENTRIES.map((entry) => [entry.id, [entry.title, entry.summary, ...entry.blocks.flatMap(blockText)].join("\n").toLowerCase()])
)

export function matchingEntries(query: string) {
  const text = query.trim().toLowerCase()
  return text ? RULE_ENTRIES.filter((entry) => SEARCHABLE.get(entry.id)!.includes(text)) : RULE_ENTRIES
}

// The entries under their category, in the file's order of categories and A to Z within each.
export function groupByCategory(entries: RuleEntry[]) {
  return RULE_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((entry) => entry.category === category.id).sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((group) => group.entries.length > 0)
}

// "p. 9", "pp. 5–7, 176": runs of neighbouring pages are joined.
export function pageLabel(pages: number[]) {
  const runs: string[] = []
  for (let i = 0; i < pages.length; ) {
    let end = i
    while (pages[end + 1] === pages[end] + 1) end++
    runs.push(end > i ? `${pages[i]}–${pages[end]}` : String(pages[i]))
    i = end + 1
  }
  return `${pages.length > 1 ? "pp." : "p."} ${runs.join(", ")}`
}
