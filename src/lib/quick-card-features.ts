import { cardsFor } from "./character-cards"
import type { Card } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { chosenOption, origins, picksOf } from "./character-grants"
import { SKILLS } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { featById } from "./character-templates/srd-5-2-1-feats"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { SPECIES_TRAIT_LIST } from "./character-templates/srd-5-2-1-origins"
import { FEATURE_STATE, STYLE_EFFECT } from "./character-templates/srd-5-2-1-states"
import { readStat } from "./character-values"
import { readSuggested } from "./quick-state"

// One thing the character has, as a row: its name, what it comes to on the right (`value`, and
// `effect` after it), and for the open row the full `description` and the `picks` as a list.
// `pick` is the panel that changes it; `chosen` is false until there is a pick.
export type Feature = {
  name: string
  value: string
  effect: string | null
  description: string
  picks: string[]
  chosen: boolean
  suggested: boolean
  pick: string | null
}
// The features of one source: the class, the background or the species. `slot` is the word of
// the sentence that picks it; `level` is only for the class.
export type FeatureCard = { label: "Class" | "Background" | "Species"; slot: "class" | "background" | "species"; name: string; level: number | null; features: Feature[] }

// How many rows each source has room for: the most any class or species lists, so the panel
// keeps its size whichever is tried on. The background gives one feat.
export const FEATURE_SLOTS = {
  Class: Math.max(...Object.values(CLASS_BUILD).map((build) => build.features.length)),
  Background: 1,
  Species: Math.max(...Object.values(SPECIES_TRAIT_LIST).map((traits) => traits.length)),
}

const skillLabel = (id: string) => SKILLS.find(([skill]) => skill === id)?.[1] ?? id
const sameTitle = (a: string, b: string) => a.toLowerCase().replace(/s$/, "") === b.toLowerCase().replace(/s$/, "")
const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`)

// What a feat does, and for Skilled what it was spent on.
function featDescription(id: string, context: GlossaryContext) {
  if (id === "Skilled") {
    const picks = picksOf(context, "skilled-picks").map((pick) => (pick.startsWith("skill:") ? skillLabel(pick.slice(6)) : pick.slice(5)))
    if (picks.length > 0) return `Proficiency in ${list(picks)}`
  }
  return featById(id)?.benefit ?? ""
}

// A feature that asks for a choice shows the pick; one without shows what it comes to.
function featureOf(name: string, summary: string, source: string, context: GlossaryContext, cards: Card[]): Feature {
  const card = cards.find((candidate) => candidate.source === source && sameTitle(candidate.decl.title, name))
  const range = name === "Darkvision" ? summary.match(/(\d+) feet/)?.[1] : undefined
  const plain: Feature = { name, value: range ? `${range} ft` : (FEATURE_STATE[name] ?? ""), effect: null, description: summary, picks: [], chosen: false, suggested: false, pick: null }
  if (!card) return plain

  const { decl, chosen } = card
  const feature = { ...plain, value: "Choose", pick: decl.field, chosen: chosen.length > 0, suggested: readSuggested(context.values).includes(decl.field) }
  if (chosen.length === 0) return feature
  if (decl.kind === "weapons") {
    const weapons = chosen.map((id) => weaponById(id))
    return {
      ...feature,
      value: chosen.map((id, index) => weapons[index]?.label ?? id).join(", "),
      picks: chosen.map((id, index) => (weapons[index] ? `${weapons[index].label} · ${weapons[index].mastery}` : id)),
    }
  }
  if (decl.kind === "feat") return { ...feature, value: chosen[0], effect: STYLE_EFFECT[chosen[0]] ?? null, description: featDescription(chosen[0], context) }
  if (decl.kind === "options") {
    const option = decl.options.find((candidate) => candidate.id === chosen[0])
    return { ...feature, value: option?.label ?? chosen[0], description: option?.note ?? summary }
  }
  if (decl.kind === "skills" || decl.kind === "expertise") return { ...feature, value: list(chosen.map(skillLabel)) }
  return { ...feature, value: chosen.join(", ") }
}

// One card each for the class, the background and the species, in that order. The feats sit in
// the card of whoever gives them.
export function featuresOf(context: GlossaryContext): FeatureCard[] {
  const { cls, background, species } = origins(context)
  const cards = cardsFor(context)
  const feat = chosenOption(context, "origin-feat")
  const level = readStat(context.values.level?.value) ?? 1
  const originFeat: Feature[] = background && feat
    ? [{ name: "Origin feat", value: feat.id, effect: null, description: featDescription(feat.id, context), picks: [], chosen: true, suggested: false, pick: "origin-feat" }]
    : []

  return [
    ...(cls ? [{ label: "Class" as const, slot: "class" as const, name: cls.label, level, features: CLASS_BUILD[cls.id].features.map((item) => featureOf(item.name, item.summary, cls.label, context, cards)) }] : []),
    ...(background ? [{ label: "Background" as const, slot: "background" as const, name: background.label, level: null, features: originFeat }] : []),
    ...(species ? [{ label: "Species" as const, slot: "species" as const, name: species.label, level: null, features: (SPECIES_TRAIT_LIST[species.id] ?? []).map((trait) => featureOf(trait.name, trait.summary, species.label, context, cards)) }] : []),
  ].filter((card) => card.features.length > 0)
}
