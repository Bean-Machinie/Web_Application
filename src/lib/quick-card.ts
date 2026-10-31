import { deriveAll } from "./character-derive"
import { chosenOption, origins } from "./character-grants"
import type { SheetField } from "./character-sheet"
import { ABILITIES, SIZES, SKILLS } from "./character-templates/srd-5-2-1"
import type { StoredValue } from "./characters"
import { readLine } from "./character-values"
import { abilityShort, NONE, signed } from "./character-format"
import { number } from "./quick-card-format"
import { featuresOf } from "./quick-card-features"
import type { FeatureCard } from "./quick-card-features"
import { gearOf } from "./quick-card-gear"
import type { GearModel } from "./quick-card-gear"
import { proficienciesOf } from "./quick-card-proficiencies"
import type { ProficiencyModel } from "./quick-card-proficiencies"

// What the character card shows, as the text of each value so two cards compare by value.
export type CardModel = {
  line: string | null
  hp: string
  ac: string
  speed: string
  size: string
  alignment: string | null
  mods: { id: string; label: string; mod: string; score: string }[]
  skills: { name: string; bonus: string }[]
  features: FeatureCard[]
  proficiency: ProficiencyModel
  gear: GearModel
}

// The values the sheet holds, run through the sheet's own formulas. The suggestions are stored,
// so the card is just those; a hovered option is tried by passing the values it would change.
export function cardOf(fields: SheetField[], values: Record<string, StoredValue>): CardModel {
  const derived = deriveAll(fields, values)
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls, species, background } = origins(context)
  const size = SIZES.find((candidate) => candidate.id === chosenOption(context, "size")?.id)
  return {
    line: [[species?.label, cls?.label].filter(Boolean).join(" "), background?.label].filter(Boolean).join(" · ") || null,
    hp: cls ? number(derived["hp.max"]) : NONE,
    ac: cls ? number(derived.ac) : NONE,
    speed: species ? number(derived.speed, " ft") : NONE,
    size: size?.label ?? NONE,
    alignment: readLine(values.alignment?.value) || null,
    mods: ABILITIES.map(([id]) => ({
      id,
      label: abilityShort(id).toUpperCase(),
      mod: cls ? signed(derived[`${id}.mod`]) : NONE,
      score: cls ? number(derived[`${id}.total`]) : NONE,
    })),
    skills: SKILLS.filter(([id]) => (derived[`skill.${id}.prof`] ?? 0) > 0).map(([id, label]) => ({ name: label, bonus: signed(derived[`skill.${id}`]) })),
    features: featuresOf(context),
    proficiency: proficienciesOf(context),
    gear: gearOf(context),
  }
}
