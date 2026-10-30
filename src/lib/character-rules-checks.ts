import { SKILLS } from "./character-templates/srd-5-2-1"
import type { SrdBackground, SrdClass, SrdSpecies } from "./character-templates/srd-5-2-1"
import type { ChoiceDecl } from "./character-templates/srd-5-2-1-choices"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { featById } from "./character-templates/srd-5-2-1-feats"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { BACKGROUND_CHOICES, SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"
import { proficientWith } from "./character-weapons"

// What the current class, species and background each ask for, by the field the pick is stored in.
export function declsOf(cls: SrdClass | undefined, species: SrdSpecies | undefined, background: SrdBackground | undefined) {
  const list: ChoiceDecl[] = [
    ...(cls ? [{ kind: "skills" as const, field: "class-skills", title: "Skills", count: cls.skillCount, from: cls.skills ?? ("any" as const) }, ...CLASS_BUILD[cls.id].choices] : []),
    ...(species ? (SPECIES_CHOICES[species.id] ?? []) : []),
    ...(background ? (BACKGROUND_CHOICES[background.id] ?? []) : []),
  ]
  return new Map(list.map((decl) => [decl.field, decl]))
}

export const countOf = (decl: ChoiceDecl) => ("count" in decl ? decl.count : 1)

// Whether one picked id is still allowed by what asks for it.
export function allowed(decl: ChoiceDecl, id: string, cls: SrdClass | undefined, order: string | undefined) {
  if (decl.kind === "skills") return decl.from === "any" ? SKILLS.some(([skill]) => skill === id) : decl.from.includes(id)
  if (decl.kind === "feat") return featById(id)?.category === decl.category
  if (decl.kind === "options") return decl.options.some((option) => option.id === id)
  if (decl.kind === "tools") return decl.from.includes(id)
  if (decl.kind === "weapons") {
    const weapon = weaponById(id)
    if (!weapon || !cls) return false
    return decl.rule === "any" || (decl.rule === "melee" ? !weapon.ranged : proficientWith(CLASS_BUILD[cls.id], weapon, order))
  }
  return true
}

// A feat held twice: the same one, unless it can be taken again, which Magic Initiate can only
// with another spell list.
export function repeats(id: string, held: string[]) {
  const feat = featById(id)
  return held.includes(id) && (!feat?.repeatable || feat.spellList !== undefined)
}

export const without = (ids: string[], taken: Iterable<string>) => {
  const set = new Set(taken)
  return ids.filter((id) => !set.has(id))
}
