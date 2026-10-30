import { SPECIES } from "./character-templates/srd-5-2-1"
import { STANDARD_LANGUAGES } from "./character-templates/srd-5-2-1-gear"
import { SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"
import { APPROACHES, SPECIES_LANGUAGES } from "./character-templates/srd-5-2-1-quick"
import { SPECIES_TRAITS } from "./character-templates/srd-5-2-1-glossary"
import { optionsOf } from "./quick-options"
import type { QuickKind, QuickOption } from "./quick-options"
import { languageCount, shownLanguages } from "./quick-view"
import type { QuickView } from "./quick-view"

export type SlotKind = QuickKind | "approach" | "lineage" | "size" | "language"

// One bracket of the sentence: what it asks for, the options to choose from, and the choice.
// `named` is for a lineage slot whose options name the species, so the sentence writes them.
// `suggested` is the option offered while nothing is chosen; the slot stays open until it is accepted.
export type Slot = { id: string; kind: SlotKind; placeholder: string; options: QuickOption[]; chosen: string | null; named?: boolean; suggested?: string }

const SIZE_OPTIONS: QuickOption[] = [
  { id: "medium", name: "Medium", line: "About 4–7 ft tall.", source: "SRD 5.2.1 · Species" },
  { id: "small", name: "Small", line: "About 2–4 ft tall.", source: "SRD 5.2.1 · Species" },
]

function lineageSlot(view: QuickView): Slot | null {
  const decl = SPECIES_CHOICES[view.species ?? ""]?.find((candidate) => candidate.kind === "options" && candidate.field === "species-option")
  if (decl?.kind !== "options") return null
  const source = `SRD 5.2.1 · p. ${SPECIES_TRAITS[view.species!].page}`
  const options = decl.options.map((option) => ({ id: option.id, name: option.label, line: option.note ?? "", source }))
  return { id: "lineage", kind: "lineage", placeholder: decl.title.toLowerCase(), options, chosen: view.lineage, named: decl.options.some((option) => option.lineage) }
}

function approachSlot(view: QuickView): Slot | null {
  const options = APPROACHES[view.cls ?? ""]
  if (!options) return null
  const list = options.map((option) => ({ id: option.id, name: option.label, line: option.line, source: "Quick build suggestion" }))
  // The first is the suggestion; it counts only once the player has accepted it.
  const chosen = options.find((option) => option.id === view.approach)?.id ?? null
  return { id: "approach", kind: "approach", placeholder: "how you fight", options: list, chosen, suggested: chosen ? undefined : options[0].id }
}

function languageSlots(view: QuickView): Slot[] {
  if (!view.species) return []
  const shown = shownLanguages(view)
  // Until some are picked, the language the species is tied to is only suggested.
  const tied = view.languages.length === 0 ? shown : []
  return Array.from({ length: languageCount(view) }, (_, index) => {
    const taken = shown.filter((_, other) => other !== index)
    const options = STANDARD_LANGUAGES.filter((language) => language !== "Common" && !taken.includes(language)).map((language) => {
      const speakers = SPECIES.find((species) => SPECIES_LANGUAGES[species.id]?.includes(language))
      return { id: language, name: language, line: speakers ? `Spoken by ${speakers.label}s.` : "A Standard Language.", source: "SRD 5.2.1 · p. 20" }
    })
    const chosen = view.languages[index] ?? null
    return { id: `language-${index}`, kind: "language" as const, placeholder: "language", options, chosen, suggested: chosen ? undefined : tied[index] }
  })
}

// The slots of the sentence in reading order; follow-ups appear once their parent is chosen.
export function slotsOf(view: QuickView): Slot[] {
  const main = (kind: QuickKind, chosen: string | null): Slot => ({ id: kind, kind, placeholder: kind, options: optionsOf(kind), chosen })
  const extra = (slot: Slot | null) => (slot ? [slot] : [])
  // Only a species with a size to choose has one, and it reads as an adjective before it.
  const size = view.species && SPECIES.find((species) => species.id === view.species)?.sizeChoice
  return [
    ...(size ? [{ id: "size", kind: "size" as const, placeholder: "size", options: SIZE_OPTIONS, chosen: view.size }] : []),
    main("species", view.species),
    ...extra(lineageSlot(view)),
    main("class", view.cls),
    main("background", view.background),
    ...extra(approachSlot(view)),
    ...languageSlots(view),
  ]
}

// The slots the sentence writes. Size and an ancestry that does not name the species are
// chosen from the card, not in the sentence.
const inSentence = (slot: Slot) => slot.kind !== "size" && (slot.kind !== "lineage" || slot.named)
export const sentenceSlots = (slots: Slot[]) => slots.filter(inSentence)

// The one next slot to answer: the first of the sentence not chosen, a suggestion included until
// it is accepted. The caret, the picker and the review all follow it.
export const nextOpen = (slots: Slot[]) => sentenceSlots(slots).find((slot) => slot.chosen === null) ?? null

export const chosenName = (slot: Slot) => slot.options.find((option) => option.id === slot.chosen)?.name ?? null
