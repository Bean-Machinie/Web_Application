import { cardsFor } from "./character-cards"
import type { Card } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { chosenOption, origins, picksOf } from "./character-grants"
import { SKILLS } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { featById } from "./character-templates/srd-5-2-1-feats"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { SPECIES_TRAIT_LIST } from "./character-templates/srd-5-2-1-origins"
import { readStat } from "./character-values"
import { readSuggested } from "./quick-state"

// One thing the character has. `eyebrow` is the feature's name when it asks for a choice, and
// then `title` is the pick ("Choose" until there is one); `pick` is the panel that changes it.
export type Feature = {
  eyebrow: string | null
  title: string
  description: string
  chips: string[]
  uses: string | null
  // Whether a pick was made, and if so whether the builder suggested it.
  chosen: boolean
  suggested: boolean
  pick: string | null
}
// The features of one source: the class, the background or the species.
export type FeatureCard = { label: "Class" | "Background" | "Species"; name: string; features: Feature[] }

// How often a feature can be used, from the same pages as the class and species summaries.
const USES: Record<string, string> = {
  Rage: "2 uses · Short Rest",
  "Second Wind": "2 uses · Short Rest",
  "Innate Sorcery": "2 uses · Long Rest",
  "Lay On Hands": "Long Rest",
  "Breath Weapon": "Proficiency Bonus uses · Long Rest",
  Stonecunning: "Proficiency Bonus uses · Long Rest",
  "Giant Ancestry": "Proficiency Bonus uses · Long Rest",
  "Relentless Endurance": "1 use · Long Rest",
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

// A feature that asks for a choice shows the pick and what it does; one without shows itself.
function featureOf(name: string, summary: string, source: string, context: GlossaryContext, cards: Card[]): Feature {
  const card = cards.find((candidate) => candidate.source === source && sameTitle(candidate.decl.title, name))
  const plain: Feature = { eyebrow: null, title: name, description: summary, chips: [], uses: USES[name] ?? null, chosen: false, suggested: false, pick: null }
  if (!card) return plain

  const { decl, chosen } = card
  const feature = { ...plain, pick: decl.field, chosen: chosen.length > 0, suggested: readSuggested(context.values).includes(decl.field) }
  if (chosen.length === 0) return { ...feature, eyebrow: name, title: "Choose", description: "" }
  // The chips say it all; the rule would only repeat the class.
  if (decl.kind === "weapons") {
    return { ...feature, description: "", chips: chosen.map((id) => { const weapon = weaponById(id); return weapon ? `${weapon.label} · ${weapon.mastery}` : id }) }
  }
  if (decl.kind === "feat") return { ...feature, eyebrow: name, title: chosen[0], description: featDescription(chosen[0], context) }
  if (decl.kind === "options") {
    const option = decl.options.find((candidate) => candidate.id === chosen[0])
    return { ...feature, eyebrow: name, title: option?.label ?? chosen[0], description: option?.note ?? "" }
  }
  if (decl.kind === "skills") return { ...feature, eyebrow: name, title: list(chosen.map(skillLabel)), description: "You add your Proficiency Bonus to checks with it." }
  if (decl.kind === "expertise") return { ...feature, eyebrow: name, title: list(chosen.map(skillLabel)), description: "Your Proficiency Bonus counts double for these skills." }
  return { ...feature, eyebrow: name, title: chosen.join(", ") }
}

// One card each for the class, the background and the species, in that order. The feats sit in
// the card of whoever gives them.
export function featuresOf(context: GlossaryContext): FeatureCard[] {
  const { cls, background, species } = origins(context)
  const cards = cardsFor(context)
  const feat = chosenOption(context, "origin-feat")
  const level = readStat(context.values.level?.value) ?? 1
  const originFeat: Feature[] = background && feat
    ? [{ eyebrow: "Origin feat", title: feat.id, description: featDescription(feat.id, context), chips: [], uses: null, chosen: true, suggested: false, pick: "origin-feat" }]
    : []

  return [
    ...(cls ? [{ label: "Class" as const, name: `${cls.label} ${level}`, features: CLASS_BUILD[cls.id].features.map((item) => featureOf(item.name, item.summary, cls.label, context, cards)) }] : []),
    ...(background ? [{ label: "Background" as const, name: background.label, features: originFeat }] : []),
    ...(species ? [{ label: "Species" as const, name: species.label, features: (SPECIES_TRAIT_LIST[species.id] ?? []).map((trait) => featureOf(trait.name, trait.summary, species.label, context, cards)) }] : []),
  ].filter((card) => card.features.length > 0)
}
