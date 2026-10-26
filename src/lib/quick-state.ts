import { ABILITY_METHODS } from "./character-templates/srd-5-2-1-quick"
import type { AbilityMethod } from "./character-templates/srd-5-2-1-quick"
import type { BuilderStep } from "./character-builder"
import { readPicks, readStat } from "./character-values"
import type { StoredValue } from "./characters"

// What the quick build keeps with a character, under ids the template does not declare:
// the table rules chosen on the start page, and which values on the sheet were suggested.
export const RULES_FIELD = "quick.rules"
export const SUGGESTED_FIELD = "quick.suggested"
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

export const readSuggested = (values: Values) => readPicks(values[SUGGESTED_FIELD]?.value)

// Whether the quick build made the character, even if every suggestion has since been replaced.
export const isQuickBuilt = (values: Values) => Array.isArray(values[SUGGESTED_FIELD]?.value)

// A marker covers one field of the builder, and the six scores with the background's
// increase count as one.
const ABILITY_FIELDS = /^(str|dex|con|int|wis|cha)$/
const MARKED = ["class-skills", "species-skill", "skilled-picks", "class-style", "species-feat", "class-masteries", "class-expertise", "languages", "equipment-class", "equipment-background"]

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

// The step of the detailed builder that changes what a marker covers.
export function stepOfMarker(key: string): BuilderStep {
  if (key === "abilities") return "abilities"
  return key.startsWith("equipment") ? "equipment" : "choices"
}
