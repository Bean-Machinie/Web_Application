import { origins } from "@/lib/character-grants"
import { BACKGROUNDS, CLASSES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"

// Choosing a class, species, lineage, background or approach. The builder and the quick build
// both choose through these, and each change goes through the character rules, which keep,
// recalculate or remove what depends on it.

export function chooseClass(actions: SheetActions, id: string) {
  if (id === origins(actions).cls?.id) return
  changeCharacter(actions, { cls: id }, `Changed to ${CLASSES.find((option) => option.id === id)?.label}`)
}

export function chooseSpecies(actions: SheetActions, id: string) {
  if (id === origins(actions).species?.id) return
  changeCharacter(actions, { species: id }, `Changed to ${SPECIES.find((option) => option.id === id)?.label}`)
}

export function chooseBackground(actions: SheetActions, id: string) {
  if (id === origins(actions).background?.id) return
  changeCharacter(actions, { background: id }, `Changed to ${BACKGROUNDS.find((option) => option.id === id)?.label}`)
}

export const chooseLineage = (actions: SheetActions, id: string) => changeCharacter(actions, { lineage: id }, "Changed lineage")

export const chooseApproach = (actions: SheetActions, id: string) => changeCharacter(actions, { approach: id }, "Changed approach")
