import { cardsFor, pendingCards } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { chosenOption, origins } from "./character-grants"
import { ABILITIES } from "./character-templates/srd-5-2-1"
import { readStat } from "./character-values"

// A pick the builder cannot suggest or that was reopened, which still needs the player: the
// key opens its panel (or, for languages, its word in the sentence).
export type Attention = { key: string; label: string }

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// The one list of what is left to pick outside the sentence's own open slots: the picks of
// the class, species, background and feats not yet whole, the scores and the equipment.
export function needsAttention(context: GlossaryContext): Attention[] {
  const { cls, species, background } = origins(context)
  if (!cls || !species || !background) return []
  const left: Attention[] = pendingCards(cardsFor(context)).map(({ decl, source, remaining }) => {
    const label =
      decl.kind === "skills" ? plural(remaining, `${source} skill`, `${source} skills`)
      : decl.kind === "weapons" ? plural(remaining, "weapon mastery", "weapon masteries")
      : decl.kind === "languages" ? plural(remaining, "language", "languages")
      : decl.kind === "expertise" ? plural(remaining, "Expertise skill", "Expertise skills")
      : decl.title
    return { key: decl.field, label }
  })
  if (ABILITIES.some(([id]) => readStat(context.values[id]?.value) === null)) left.push({ key: "abilities", label: "Ability scores" })
  if (!["equipment-class", "equipment-background"].every((field) => chosenOption(context, field))) left.push({ key: "equipment", label: "Equipment" })
  return left
}
