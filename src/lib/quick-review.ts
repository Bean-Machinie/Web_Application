import { BACKGROUNDS, CLASSES, SKILLS, SPECIES } from "./character-templates/srd-5-2-1"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { ABILITY_METHODS } from "./character-templates/srd-5-2-1-quick"
import { planQuickBuild } from "./quick-plan"
import { stepOfMarker } from "./quick-state"
import type { QuickRules } from "./quick-state"
import type { Slot } from "./quick-slots"
import type { QuickView } from "./quick-view"
import type { BuilderStep } from "./character-builder"

// A pick the quick build made for the player. Languages are changed in the sentence, the
// others in the step of the detailed builder where they are chosen.
export type ReviewRow = { key: string; label: string; value: string; slot?: string; step?: BuilderStep }

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
  "equipment-class": "Class equipment",
  "equipment-background": "Background equipment",
}

const skillName = (id: string) => SKILLS.find(([other]) => other === id.replace("skill:", ""))?.[1] ?? id.replace("tool:", "")
const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : [])

// What "Create character" will fill in, for the review: the plan's suggestions in words.
export function suggestedRows(view: QuickView, rules: QuickRules): ReviewRow[] {
  const cls = CLASSES.find((option) => option.id === view.cls)
  const species = SPECIES.find((option) => option.id === view.species)
  const background = BACKGROUNDS.find((option) => option.id === view.background)
  if (!cls || !species || !background) return []
  const plan = planQuickBuild(cls, species, background, rules, { approach: view.approach, languages: view.languages })

  const text: Record<string, string> = {
    abilities: ABILITY_METHODS.find((method) => method.id === rules.method)!.label,
    "class-skills": list(plan.values["class-skills"]).map(skillName).join(", "),
    "species-skill": list(plan.values["species-skill"]).map(skillName).join(", "),
    "skilled-picks": list(plan.values["skilled-picks"]).map(skillName).join(", "),
    "class-expertise": list(plan.values["class-expertise"]).map(skillName).join(", "),
    "class-masteries": list(plan.values["class-masteries"]).map((id) => weaponById(id)?.label ?? id).join(", "),
    "equipment-class": plan.classKit.label,
    "equipment-background": plan.backgroundKit.label,
  }
  return plan.suggested.map((key) => {
    const value = text[key] ?? list(plan.values[key]).join(", ")
    return key === "languages" ? { key, label: LABELS[key], value, slot: "language-0" } : { key, label: LABELS[key] ?? key, value, step: stepOfMarker(key) }
  })
}

// The slots still empty, to finish in the sentence. Languages are optional, so a language not
// picked yet is open but does not hold up Create.
export const openSlots = (slots: Slot[]) => slots.filter((slot) => slot.chosen === null)

export const openLabel = (slot: Slot) => `${slot.placeholder[0].toUpperCase()}${slot.placeholder.slice(1)}`
