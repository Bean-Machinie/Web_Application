// The shape of src/data/srd-rules-reference.json, the SRD 5.2.1 rules reference.

export type RuleFact = { label: string; value: string; ref?: string }

export type RuleEffect = { label: string; text: string; example?: string; items?: RuleEffect[]; bullets?: string[] }

export type RuleBlock =
  | { type: "text"; text: string }
  | { type: "effects"; items: RuleEffect[] }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  | { type: "example"; text: string }
  | { type: "usedBy"; items: { ref: string; text: string }[] }
  | { type: "links"; label?: string; items: string[] }
  | { type: "bullets"; items: string[] }

export type RuleEntry = {
  id: string
  title: string
  // Skill, Action, Condition and so on; null for most.
  tag: string | null
  category: string
  summary: string
  facts: RuleFact[]
  blocks: RuleBlock[]
  seeAlso: string[]
  pages: number[]
}

export type RuleCategory = { id: string; title: string }
