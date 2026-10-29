import { deriveAll } from "./character-derive"
import { featGrants } from "./character-grants"
import type { SheetField } from "./character-sheet"
import { ABILITIES, BACKGROUNDS, CLASSES, SKILLS, SPECIES } from "./character-templates/srd-5-2-1"
import type { StoredValue } from "./characters"
import { planQuickBuild } from "./quick-plan"
import type { QuickRules } from "./quick-state"
import type { QuickView } from "./quick-view"

// What the character card shows, as the text of each value so two cards compare by value.
export type CardModel = {
  line: string | null
  hp: string
  ac: string
  speed: string
  darkvision: string
  mods: { id: string; label: string; value: string }[]
  feat: string
  skills: string[]
}

const NONE = "—"
const number = (value: number | null | undefined, unit = "") => (value === null || value === undefined ? NONE : `${value}${unit}`)
const signed = (value: number | null | undefined) => (value === null || value === undefined ? NONE : value >= 0 ? `+${value}` : `−${-value}`)

// Fields the plan fills in for a species or background that is not chosen yet.
const OF_SPECIES = ["species-skill", "species-feat", "languages"]
const OF_BACKGROUND = ["ability-increase", "equipment-background"]

// The values the sheet would hold with this view and the quick build's suggestions, run through
// the sheet's own formulas. Nothing is stored. The plan needs a species and a background, so
// a stand-in is used until they are chosen and what only they decide is left out.
export function cardOf(view: QuickView, fields: SheetField[], stored: Record<string, StoredValue>, rules: QuickRules): CardModel {
  const cls = CLASSES.find((option) => option.id === view.cls)
  const species = SPECIES.find((option) => option.id === view.species)
  const background = BACKGROUNDS.find((option) => option.id === view.background)

  const values = { ...stored }
  const put = (field: string, value: unknown) => (values[field] = { pinned: null, value })
  put("character-class", view.cls)
  put("species-choice", view.species)
  put("background-choice", view.background)
  put("species-option", view.lineage ? [view.lineage] : null)
  put("size", view.size)
  if (cls) {
    const plan = planQuickBuild(cls, species ?? SPECIES[0], background ?? BACKGROUNDS[0], rules, { approach: view.approach, languages: view.languages })
    for (const [field, value] of Object.entries(plan.values)) put(field, value)
    for (const field of [...(species ? [] : OF_SPECIES), ...(background ? [] : OF_BACKGROUND)]) put(field, null)
  }

  const derived = deriveAll(fields, values)
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  return {
    line: [[species?.label, cls?.label].filter(Boolean).join(" "), background?.label].filter(Boolean).join(" · ") || null,
    hp: cls ? number(derived["hp.max"]) : NONE,
    ac: cls ? number(derived.ac) : NONE,
    speed: species ? number(derived.speed, " ft") : NONE,
    darkvision: species ? (derived.darkvision ? `${derived.darkvision} ft` : "None") : NONE,
    mods: ABILITIES.map(([id, label]) => ({ id, label: label.slice(0, 3).toUpperCase(), value: cls ? signed(derived[`${id}.mod`]) : NONE })),
    feat: featGrants(context).filter((grant) => grant.slot !== "class-style").map((grant) => grant.id).join(", "),
    skills: SKILLS.filter(([id]) => (derived[`skill.${id}.prof`] ?? 0) > 0).map(([, label]) => label),
  }
}
