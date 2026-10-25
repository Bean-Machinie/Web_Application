import { option } from "./formulas"
import * as table from "./dnd-5e-2024-tables"
import { BACKSTORY } from "./srd-5-2-1-backstory"
import type { TemplateField } from "./types"

// The builder’s own fields. They have no place on the sheet: what they hold is read by
// formulas (a skill picked, the armor worn) or by the builder itself.

const slot = (id: string): TemplateField => ({ id, tab: "overview", section: "background", type: "picks", label: id, hidden: true })

// Each is a list of the ids picked: skills, a feat, weapons, an option, tools, languages.
// class-skills is with the skills.
export const slotFields: TemplateField[] = [
  "class-style",
  "class-masteries",
  "class-expertise",
  "class-order",
  "class-invocation",
  "class-tools",
  "background-tool",
  "species-option",
  "species-skill",
  "species-ability",
  "species-feat",
  "skilled-picks",
  "origin-feat.ability",
  "species-feat.ability",
  "languages",
].map(slot)

const equipment = { tab: "overview", section: "background", hidden: true } as const

// The equipment option of the class and of the background, and the armor the class’s makes
// the character wear.
export const equipmentFields: TemplateField[] = [
  { ...equipment, id: "equipment-class", type: "choice", label: "Class equipment", choices: { by: "character-class", options: table.CLASS_KIT_OPTIONS } },
  { ...equipment, id: "equipment-background", type: "choice", label: "Background equipment", choices: { by: "background-choice", options: table.BACKGROUND_KIT_OPTIONS } },
  {
    ...equipment, id: "armor-worn", type: "choice", label: "Armor worn", choices: { options: table.ARMOR_OPTIONS },
    derived: option("armor-worn", "equipment-class", table.KIT_ARMOR),
  },
]

// Backstory questions, answered in the builder and kept in the Notes tab.
export const backstoryFields: TemplateField[] = BACKSTORY.map((question, index) => ({
  id: `backstory.${index + 1}`,
  tab: "notes",
  section: "backstory",
  type: "line" as const,
  label: question.label,
  title: question.question,
}))
