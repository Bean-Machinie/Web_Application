import type { Derived } from "./character-derive"
import { origins } from "./character-grants"
import { stillToChoose } from "./character-builder"
import type { SheetField } from "./character-sheet"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { isQuickBuilt } from "./quick-state"
import type { Character, StoredValue } from "./characters"

type Sheet = { character: Character; fields: SheetField[]; values: Record<string, StoredValue>; derived: Derived }

// Where an item of the list is finished.
export type FinishItem = { label: string; step: "abilities" | "species" | "choices" | "spells" }

// What the quick build left open: languages, a gaming set or tool kind, a lineage or order,
// and spells for a caster. Only for a character the quick build made.
export function toFinish(sheet: Sheet): FinishItem[] {
  if (!isQuickBuilt(sheet.values)) return []
  const context = { values: sheet.values, derived: sheet.derived, byId: new Map(sheet.fields.map((field) => [field.id, field])) }
  const { cls } = origins(context)
  // Equipment is chosen, and the name and alignment are not part of the build.
  const left = stillToChoose(sheet).filter((label) => !["Name", "Alignment", "Equipment"].includes(label))
  const items = left.map((label): FinishItem => ({ label, step: label === "Ability scores" ? "abilities" : label === "Size" ? "species" : "choices" }))
  const spells = !!cls && CLASS_BUILD[cls.id].spellcaster
  return spells ? [...items, { label: "Spells", step: "spells" }] : items
}
