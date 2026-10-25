import { origins, picksOf } from "@/lib/character-grants"
import { BACKGROUNDS } from "@/lib/character-templates/srd-5-2-1"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import { readStat } from "@/lib/character-values"
import { clearFields } from "./builder-clear"
import type { SheetActions } from "./character-actions"
import { applyKits, chosenKits } from "./character-kits"

// Choosing a class, species or background, with the clean-up each needs. The steps of the
// builder and the quick build both choose through these.

// Everything picked for the old class, which the new one cannot use.
const CLASS_FIELDS = ["class-skills", "class-style", "class-masteries", "class-expertise", "class-order", "class-invocation", "class-tools", "equipment-class"]

export function chooseClass(actions: SheetActions, id: string) {
  if (id === origins(actions).cls?.id) return
  actions.onValue("character-class", id)
  clearFields(actions, CLASS_FIELDS)
  // Whatever the old class’s kit put on the sheet goes with it.
  const { backgroundKit } = chosenKits(actions)
  applyKits(actions, backgroundKit ? [backgroundKit] : [], {}, id)
  // A new character starts at level 1 (p. 19).
  if (readStat(actions.values.level?.value) === null) actions.onValue("level", 1)
}

export function chooseSpecies(actions: SheetActions, id: string) {
  if (id === origins(actions).species?.id) return
  actions.onValue("species-choice", id)
  // What the old species asked for, and a size picked for it, are not the new one’s.
  clearFields(actions, ["size", "species-option", "species-skill", "species-ability", "species-feat", "species-feat.ability"])
}

// A new background can give what an earlier pick already made: a skill, or a feat that can
// be taken only once. The earlier pick is dropped, so nothing is held twice.
function dropRepeats(actions: SheetActions, background: (typeof BACKGROUNDS)[number]) {
  for (const field of ["class-skills", "species-skill"]) {
    const kept = picksOf(actions, field).filter((skill) => !background.skills.includes(skill))
    if (kept.length !== picksOf(actions, field).length) actions.onValue(field, kept.length > 0 ? kept : null)
  }
  const feat = featById(background.feat)
  if (feat && !feat.repeatable && picksOf(actions, "species-feat").includes(feat.id)) {
    clearFields(actions, ["species-feat", "species-feat.ability"])
  }
}

export function chooseBackground(actions: SheetActions, id: string) {
  if (id === origins(actions).background?.id) return
  actions.onValue("background-choice", id)
  dropRepeats(actions, BACKGROUNDS.find((option) => option.id === id)!)
  clearFields(actions, ["ability-increase", "background-tool", "origin-feat.ability", "equipment-background"])
  const { classKit } = chosenKits(actions)
  applyKits(actions, classKit ? [classKit] : [])
}
