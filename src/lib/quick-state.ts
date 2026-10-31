import { ABILITY_METHODS } from "./character-templates/srd-5-2-1-quick"
import type { AbilityMethod } from "./character-templates/srd-5-2-1-quick"
import { readPicks, readStat } from "./character-values"
import type { StoredValue } from "./characters"

// What the quick build keeps with a character, under ids the template does not declare:
// the table rules chosen on the start page, and which values on the sheet were suggested.
export const RULES_FIELD = "quick.rules"
export const SUGGESTED_FIELD = "quick.suggested"
// Whether Create was pressed. False while the character is a draft; absent on characters made
// before drafts, which are not drafts.
export const CREATED_FIELD = "quick.created"
// What the builder last wrote for the starting kits, so a later difference is the player's edit.
export const KITS_FIELD = "quick.kits"
// The six scores last rolled for the ability scores, to hand out among the abilities.
export const ROLLED_FIELD = "quick.rolled"
// How the character fights, when the player chose; none means the class’s first.
export const APPROACH_FIELD = "quick.approach"

type Values = Record<string, StoredValue>

export type QuickRules = { level: number; method: AbilityMethod }
export const DEFAULT_RULES: QuickRules = { level: 1, method: "standard" }

export function readRules(values: Values): QuickRules {
  const stored = values[RULES_FIELD]?.value as Partial<QuickRules> | null | undefined
  const method = ABILITY_METHODS.find((candidate) => candidate.id === stored?.method)?.id
  return { level: Math.min(Math.max(readStat(stored?.level) ?? 1, 1), 20), method: method ?? DEFAULT_RULES.method }
}

export function readRolled(values: Values) {
  const stored = values[ROLLED_FIELD]?.value
  return Array.isArray(stored) ? stored.filter((value): value is number => typeof value === "number") : []
}

export const readSuggested = (values: Values) => readPicks(values[SUGGESTED_FIELD]?.value)

// Whether the quick build made the character, even if every suggestion has since been replaced.
export const isQuickBuilt = (values: Values) => Array.isArray(values[SUGGESTED_FIELD]?.value)

// A marker covers one field of the builder, and the six scores with the background's
// increase count as one.
const ABILITY_FIELDS = /^(str|dex|con|int|wis|cha)$/
export const MARKED = [
  "class-skills", "species-skill", "skilled-picks", "class-style", "species-feat", "class-masteries", "class-expertise", "languages", "equipment-class", "equipment-background",
  "size", "species-option", "species-ability", "class-order", "class-invocation", "class-tools", "background-tool", "origin-feat.ability", "species-feat.ability",
]

// The marker a change to this field takes away: the player has now chosen it themselves.
export function markerOfField(fieldId: string) {
  if (ABILITY_FIELDS.test(fieldId) || fieldId === "ability-increase") return "abilities"
  return MARKED.includes(fieldId) ? fieldId : null
}

// The marker to show beside a field of the sheet, if what it holds was suggested.
export function markerShownFor(fieldId: string, values: Values) {
  const suggested = readSuggested(values)
  if (ABILITY_FIELDS.test(fieldId)) return suggested.includes("abilities") ? "abilities" : null
  if (fieldId === "inventory") return ["equipment-class", "equipment-background"].find((key) => suggested.includes(key)) ?? null
  const skill = fieldId.match(/^skill\.([a-z-]+)\.prof$/)?.[1]
  if (!skill) return null
  return ["class-skills", "species-skill", "skilled-picks"].find(
    (key) => suggested.includes(key) && readPicks(values[key]?.value).some((id) => id === skill || id === `skill:${skill}`)
  ) ?? null
}
