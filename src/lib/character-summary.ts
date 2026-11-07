import { origins } from "./character-grants"
import { deriveAll } from "./character-derive"
import { sheetFields } from "./character-sheet"
import { templateFor } from "./character-templates"
import { readStat } from "./character-values"
import { needsAttention } from "./quick-attention"
import { speciesText } from "./quick-card-line"
import type { Character, StoredValue } from "./characters"

// What a character's card says: "Level 3 Gnome Barbarian" (null while no species or class is
// chosen) and how many picks a draft still has to make.
export type CharacterSummary = { line: string | null; picksLeft: number }

export function summarize(character: Character, values: Record<string, StoredValue>): CharacterSummary | null {
  const template = templateFor(character.templateId, character.templateVersion)
  if (!template) return null

  const fields = sheetFields(template, [])
  const context = { values, derived: deriveAll(fields, values), byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls, species } = origins(context)
  const level = readStat(values.level?.value) ?? 1
  const line = species || cls ? [`Level ${level}`, species && speciesText(context, species), cls?.label].filter(Boolean).join(" ") : null
  return { line, picksLeft: needsAttention(context).length }
}

// Under the name: the draft's picks left, else "Level 3 Gnome Barbarian", else the concept.
export function characterSubtitle(character: Character, summary: CharacterSummary | null) {
  if (character.draft) return summary && summary.picksLeft > 0 ? `Draft · ${summary.picksLeft} ${summary.picksLeft === 1 ? "pick" : "picks"} left` : "Draft"
  return summary?.line ?? (character.concept || "Character")
}
