import { fromOthers, origins, picksOf, skillGrants, toolGrants } from "@/lib/character-grants"
import { proficientWith } from "@/lib/character-weapons"
import { SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import {
  ARTISAN_TOOLS,
  GAMING_SETS,
  MASTERY_NOTES,
  MUSICAL_INSTRUMENTS,
  OTHER_TOOLS,
  STANDARD_LANGUAGES,
  WEAPONS,
} from "@/lib/character-templates/srd-5-2-1-gear"
import type { ChoiceDecl } from "@/lib/character-templates/srd-5-2-1-choices"
import type { Chip } from "./BuilderChipPicker"
import type { SheetActions } from "./character-actions"

// The chips of each kind of choice that is picked from a list of names.
export function weaponChips(decl: Extract<ChoiceDecl, { kind: "weapons" }>, actions: SheetActions): Chip[] {
  const { cls } = origins(actions)
  const build = cls ? CLASS_BUILD[cls.id] : null
  const order = picksOf(actions, "class-order")[0]
  return WEAPONS.filter((weapon) => {
    if (decl.rule === "melee") return !weapon.ranged
    return decl.rule === "any" || (build ? proficientWith(build, weapon, order) : false)
  }).map((weapon) => ({ id: weapon.id, label: `${weapon.label} · ${weapon.mastery}`, note: MASTERY_NOTES[weapon.mastery] }))
}

// Skills the character is proficient in now, for Expertise.
export function expertiseChips(actions: SheetActions): Chip[] {
  return SKILLS.filter(([id]) => (actions.derived[`skill.${id}.prof`] ?? 0) > 0).map(([id, label]) => ({ id, label }))
}

export function toolChips(decl: { field: string; from: string[] }, actions: SheetActions): Chip[] {
  const others = fromOthers(toolGrants(actions), decl.field)
  return decl.from.map((tool) => ({ id: tool, label: tool, from: others.find((grant) => grant.id === tool)?.source }))
}

// Common is known and not picked; the rest are.
export const languageChips = (): Chip[] => STANDARD_LANGUAGES.filter((language) => language !== "Common").map((language) => ({ id: language, label: language }))

// Skilled: any skills and tools, as "skill:…" and "tool:…".
export function skilledChips(actions: SheetActions, field: string) {
  const skills = fromOthers(skillGrants(actions), field)
  const tools = fromOthers(toolGrants(actions), field)
  return {
    skills: SKILLS.map(([id, label]): Chip => ({ id: `skill:${id}`, label, from: skills.find((grant) => grant.id === id)?.source })),
    tools: [...ARTISAN_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS, ...OTHER_TOOLS].map(
      (tool): Chip => ({ id: `tool:${tool}`, label: tool, from: tools.find((grant) => grant.id === tool)?.source })
    ),
  }
}
