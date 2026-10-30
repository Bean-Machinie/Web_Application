import { deriveAll } from "./character-derive"
import { featGrants, origins } from "./character-grants"
import type { SheetField } from "./character-sheet"
import { ABILITIES, SKILLS } from "./character-templates/srd-5-2-1"
import type { StoredValue } from "./characters"

// What the character card shows, as the text of each value so two cards compare by value.
export type CardModel = {
  line: string | null
  hp: string
  ac: string
  speed: string
  mods: { id: string; label: string; mod: string; score: string }[]
  // Each with where it comes from: "Savage Attacker · Soldier".
  feats: { name: string; source: string }[]
  skills: { name: string; bonus: string }[]
}

const NONE = "—"
const number = (value: number | null | undefined, unit = "") => (value === null || value === undefined ? NONE : `${value}${unit}`)
const signed = (value: number | null | undefined) => (value === null || value === undefined ? NONE : value >= 0 ? `+${value}` : `−${-value}`)

// The values the sheet holds, run through the sheet's own formulas. The suggestions are stored,
// so the card is just those; a hovered option is tried by passing the values it would change.
export function cardOf(fields: SheetField[], values: Record<string, StoredValue>): CardModel {
  const derived = deriveAll(fields, values)
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls, species, background } = origins(context)
  return {
    line: [[species?.label, cls?.label].filter(Boolean).join(" "), background?.label].filter(Boolean).join(" · ") || null,
    hp: cls ? number(derived["hp.max"]) : NONE,
    ac: cls ? number(derived.ac) : NONE,
    speed: species ? number(derived.speed, " ft") : NONE,
    mods: ABILITIES.map(([id, label]) => ({
      id,
      label: label.slice(0, 3).toUpperCase(),
      mod: cls ? signed(derived[`${id}.mod`]) : NONE,
      score: cls ? number(derived[`${id}.total`]) : NONE,
    })),
    feats: featGrants(context).filter((grant) => grant.slot !== "class-style").map((grant) => ({ name: grant.id, source: grant.source })),
    skills: SKILLS.filter(([id]) => (derived[`skill.${id}.prof`] ?? 0) > 0).map(([id, label]) => ({ name: label, bonus: signed(derived[`skill.${id}`]) })),
  }
}
