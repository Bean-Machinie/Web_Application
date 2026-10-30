import { ABILITIES, SIZES, SKILLS } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { BACKGROUND_CHOICES, SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { BACKGROUND_KITS, CLASS_KITS } from "./character-templates/srd-5-2-1-kits"
import { ABILITY_METHODS } from "./character-templates/srd-5-2-1-quick"
import { readRules, readSuggested } from "./quick-state"
import type { StoredValue } from "./characters"
import type { Slot } from "./quick-slots"

// A pick the quick build made for the player. Languages are changed in the sentence, the
// others in the step of the detailed builder where they are chosen.
export type ReviewRow = { key: string; label: string; value: string; slot?: string }

const LABELS: Record<string, string> = {
  abilities: "Ability scores",
  "class-skills": "Class skills",
  "species-skill": "Species skill",
  "skilled-picks": "Skilled",
  "class-style": "Fighting Style",
  "species-feat": "Versatile feat",
  "class-masteries": "Weapon mastery",
  "class-expertise": "Expertise",
  languages: "Languages",
  size: "Size",
  "species-option": "Ancestry",
  "species-ability": "Spellcasting ability",
  "class-order": "Order",
  "class-invocation": "Invocation",
  "class-tools": "Tool proficiency",
  "background-tool": "Gaming set",
  "origin-feat.ability": "Spellcasting ability",
  "species-feat.ability": "Spellcasting ability",
  "equipment-class": "Class equipment",
  "equipment-background": "Background equipment",
}

const skillName = (id: string) => SKILLS.find(([other]) => other === id.replace("skill:", ""))?.[1] ?? id.replace("tool:", "")
// An option's name from the choices of the class, species and background, else the id.
const optionName = (id: string) => {
  const decls = [...Object.values(SPECIES_CHOICES), ...Object.values(BACKGROUND_CHOICES), ...Object.values(CLASS_BUILD).flatMap((build) => build.choices)].flat()
  const found = decls.flatMap((decl) => (decl.kind === "options" ? decl.options : [])).find((option) => option.id === id)
  return found?.label ?? ABILITIES.find(([other]) => other === id)?.[1] ?? id
}
const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : [])

// A kit by id, from either list.
const kitLabel = (id: string) => [...Object.values(CLASS_KITS), ...Object.values(BACKGROUND_KITS)].flat().find((kit) => kit.id === id)?.label ?? id

// What the builder suggested and the player has not changed, for the review: the stored
// values in words, in the order of the markers.
export function suggestedRows(values: Record<string, StoredValue>): ReviewRow[] {
  const rules = readRules(values)
  const stored = (key: string) => values[key]?.value
  const picks = (key: string) => list(stored(key))
  const text: Record<string, string> = {
    abilities: ABILITY_METHODS.find((method) => method.id === rules.method)!.label,
    "class-skills": picks("class-skills").map(skillName).join(", "),
    "species-skill": picks("species-skill").map(skillName).join(", "),
    "skilled-picks": picks("skilled-picks").map(skillName).join(", "),
    "class-expertise": picks("class-expertise").map(skillName).join(", "),
    "class-masteries": picks("class-masteries").map((id) => weaponById(id)?.label ?? id).join(", "),
    "equipment-class": kitLabel(String(stored("equipment-class"))),
    "equipment-background": kitLabel(String(stored("equipment-background"))),
    size: SIZES.find((size) => size.id === stored("size"))?.label ?? "",
  }
  return readSuggested(values).flatMap((key) => {
    const value = text[key] ?? picks(key).map(optionName).join(", ")
    if (!value) return []
    return [key === "languages" ? { key, label: LABELS[key], value, slot: "language-0" } : { key, label: LABELS[key] ?? key, value }]
  })
}

export const openLabel = (slot: Slot) => `${slot.placeholder[0].toUpperCase()}${slot.placeholder.slice(1)}`
