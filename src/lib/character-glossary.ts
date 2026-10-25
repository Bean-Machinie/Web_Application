import type { Derived } from "./character-derive"
import { yoursFor } from "./character-glossary-yours"
import type { SheetField } from "./character-sheet"
import { GLOSSARY } from "./character-templates/srd-5-2-1-glossary"
import type { GlossaryEntry } from "./character-templates/srd-5-2-1-glossary"
import type { StoredValue } from "./characters"

// What a hover card needs to work out "your value": the character’s numbers.
export type GlossaryContext = { values: Record<string, StoredValue>; derived: Derived; byId: Map<string, SheetField> }

export type Explanation = { key: string; entry: GlossaryEntry; yours: string[] }

const BY_ID: Record<string, string> = {
  "character-class": "class",
  level: "level",
  "species-choice": "species",
  "background-choice": "background",
  alignment: "alignment",
  "ability-increase": "ability-increase",
  "origin-feat": "origin-feat",
  "tool-proficiency": "tool",
  "species-feat": "versatile",
  ac: "ac",
  initiative: "initiative",
  speed: "speed",
  size: "size",
  darkvision: "darkvision",
  "passive-perception": "passive-perception",
  "proficiency-bonus": "proficiency-bonus",
  hp: "hp",
  "hit-dice": "hit-dice",
  "hit-die": "hit-die",
  "death-saves.successes": "death-saves",
  "death-saves.failures": "death-saves",
  inspiration: "inspiration",
  "spell-ability": "spell-ability",
  "spell-dc": "spell-dc",
  "spell-attack": "spell-attack",
  "carrying-capacity": "carrying-capacity",
  attacks: "attacks",
}

// Which entry of the glossary a field’s label explains.
function keyFor(id: string) {
  if (BY_ID[id]) return BY_ID[id]
  const ability = id.match(/^(str|dex|con|int|wis|cha)(\.total)?$/)
  if (ability) return `ability.${ability[1]}`
  if (/^(str|dex|con|int|wis|cha)\.mod$/.test(id)) return "modifier"
  const save = id.match(/^save\.(\w+?)(\.prof)?$/)
  if (save) return `save.${save[1]}`
  const skill = id.match(/^skill\.([a-z-]+?)(\.prof)?$/)
  if (skill) return `skill.${skill[1]}`
  return id.startsWith("coin.") ? "coins" : null
}

// The explanation for a field’s label, or null where the SRD has nothing to say.
export function explain(field: SheetField, context: GlossaryContext): Explanation | null {
  return field.custom ? null : explainKey(keyFor(field.id), field.id, context)
}

// The same, for a label that is not a field’s, like the builder’s: by glossary key.
export function explainKey(key: string | null, fieldId: string, context: GlossaryContext): Explanation | null {
  const entry = key ? GLOSSARY[key] : undefined
  return key && entry ? { key, entry, yours: yoursFor(key, fieldId, context) } : null
}
