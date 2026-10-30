import { origins } from "@/lib/character-grants"
import { BACKGROUNDS, CLASSES, SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { withPick } from "@/lib/quick-view"
import type { QuickView } from "@/lib/quick-view"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"

// Every choice of the builder is stored here, and goes through the character rules, which keep,
// recalculate or remove what depends on it. The toast says what was removed, with Undo.

const labelOf = (list: { id: string; label: string }[], id: string) => list.find((option) => option.id === id)?.label

export function chooseClass(actions: SheetActions, id: string) {
  if (id !== origins(actions).cls?.id) changeCharacter(actions, { cls: id }, `Changed to ${labelOf(CLASSES, id)}`)
}

export function chooseSpecies(actions: SheetActions, id: string) {
  if (id !== origins(actions).species?.id) changeCharacter(actions, { species: id }, `Changed to ${labelOf(SPECIES, id)}`)
}

export function chooseBackground(actions: SheetActions, id: string) {
  if (id !== origins(actions).background?.id) changeCharacter(actions, { background: id }, `Changed to ${labelOf(BACKGROUNDS, id)}`)
}

// Stores the option chosen in a slot of the sentence.
export function commitPick(actions: SheetActions, view: QuickView, slot: string, id: string) {
  if (slot === "class") chooseClass(actions, id)
  else if (slot === "species") chooseSpecies(actions, id)
  else if (slot === "background") chooseBackground(actions, id)
  else if (slot === "approach") changeCharacter(actions, { approach: id }, "Changed approach")
  else if (slot === "lineage") changeCharacter(actions, { lineage: id }, "Changed lineage")
  else if (slot === "size") changeCharacter(actions, { pick: { values: { size: id } } }, "Changed size")
  else changeCharacter(actions, { pick: { values: { languages: withPick(view, slot, id).languages } } }, "Changed languages")
}
