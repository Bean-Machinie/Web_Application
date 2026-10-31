import { cardsFor } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { origins } from "./character-grants"
import type { SrdSpecies } from "./character-templates/srd-5-2-1"
import { readStat } from "./character-values"

// The species as the sentence reads it: a lineage that names the species stands in for it ("High
// Elf"), and one that describes it leads it ("Red Dragonborn").
function speciesText(context: GlossaryContext, species: SrdSpecies) {
  const card = cardsFor(context).find((candidate) => candidate.decl.field === "species-option")
  if (card?.decl.kind !== "options") return species.label
  const option = card.decl.options.find((candidate) => candidate.id === card.chosen[0])
  if (!option?.lineage) return species.label
  return card.decl.options.some((candidate) => candidate.adjective) ? `${option.label} ${species.label}` : option.label
}

// "Human Fighter · Soldier · Level 1", or null while nothing is chosen.
export function lineOf(context: GlossaryContext) {
  const { cls, species, background } = origins(context)
  const level = readStat(context.values.level?.value) ?? 1
  const line = [[species && speciesText(context, species), cls?.label].filter(Boolean).join(" "), background?.label].filter(Boolean).join(" · ")
  return line ? `${line} · Level ${level}` : null
}
