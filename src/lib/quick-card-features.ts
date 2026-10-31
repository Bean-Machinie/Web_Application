import { cardsFor } from "./character-cards"
import type { Card } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { featGrants, origins } from "./character-grants"
import { SKILLS } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { featById } from "./character-templates/srd-5-2-1-feats"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { SPECIES_TRAIT_LIST } from "./character-templates/srd-5-2-1-origins"

// `pick` is the panel that changes it, for a feature that asks for a choice.
export type Feature = { name: string; summary: string; source: string; pick: string | null }
export type FeatureGroup = { title: string; features: Feature[] }

const skillLabel = (id: string) => SKILLS.find(([skill]) => skill === id)?.[1] ?? id
const sameTitle = (a: string, b: string) => a.toLowerCase().replace(/s$/, "") === b.toLowerCase().replace(/s$/, "")

function chosenText({ decl, chosen }: Card) {
  if (decl.kind === "weapons") return chosen.map((id) => weaponById(id)?.label ?? id).join(", ")
  if (decl.kind === "options") return chosen.map((id) => decl.options.find((option) => option.id === id)?.label ?? id).join(", ")
  if (decl.kind === "skills" || decl.kind === "expertise") return chosen.map(skillLabel).join(", ")
  return chosen.join(", ")
}

// A feature that asks for a choice shows what was chosen, and opens that choice's panel.
function featureOf(name: string, summary: string, source: string, cards: Card[]): Feature {
  const card = cards.find((candidate) => candidate.source === source && sameTitle(candidate.decl.title, name))
  if (!card) return { name, summary, source, pick: null }
  return { name: card.chosen.length > 0 ? `${name}: ${chosenText(card)}` : name, summary, source, pick: card.decl.field }
}

// The feats held, then the class's level 1 features and the species' traits, as the SRD lists them.
export function featuresOf(context: GlossaryContext): FeatureGroup[] {
  const { cls, species } = origins(context)
  const cards = cardsFor(context)
  const feats = featGrants(context)
    .filter((grant) => grant.slot !== "class-style")
    .map((grant) => ({ name: grant.id, summary: featById(grant.id)?.benefit ?? "", source: grant.source, pick: grant.slot === "origin-feat" ? "origin-feat" : null }))

  return [
    { title: "Feats", features: feats },
    ...(cls ? [{ title: cls.label, features: CLASS_BUILD[cls.id].features.map((feature) => featureOf(feature.name, feature.summary, cls.label, cards)) }] : []),
    ...(species ? [{ title: species.label, features: (SPECIES_TRAIT_LIST[species.id] ?? []).map((trait) => featureOf(trait.name, trait.summary, species.label, cards)) }] : []),
  ].filter((group) => group.features.length > 0)
}
