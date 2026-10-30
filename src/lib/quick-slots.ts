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
// `named` is for a lineage slot the sentence asks for, and `leads` when its word comes before the
// species word ("Gold Dragonborn") instead of standing in for it ("High Elf").
// `suggested` is the option offered while nothing is chosen; the slot stays open until it is accepted.
export type Slot = { id: string; kind: SlotKind; placeholder: string; options: QuickOption[]; chosen: string | null; named?: boolean; leads?: boolean; suggested?: string }

const SIZE_OPTIONS: QuickOption[] = [
  { id: "medium", name: "Medium", line: "About 4–7 ft tall.", source: "SRD 5.2.1 · Species" },
  { id: "small", name: "Small", line: "About 2–4 ft tall.", source: "SRD 5.2.1 · Species" },
]

function lineageSlot(view: QuickView): Slot | null {
  const decl = SPECIES_CHOICES[view.species ?? ""]?.find((candidate) => candidate.kind === "options" && candidate.field === "species-option")
  if (decl?.kind !== "options") return null
  const source = `SRD 5.2.1 · p. ${SPECIES_TRAITS[view.species!].page}`
  const options = decl.options.map((option) => ({ id: option.id, name: option.label, line: option.note ?? "", source }))
  return { id: "lineage", kind: "lineage", placeholder: decl.title.toLowerCase(), options, chosen: view.lineage, named: decl.options.some((option) => option.lineage), leads: decl.options.some((option) => option.adjective) }
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
  return Array.from({ length: languageCount(view) }, (_, index) => {
    const taken = shown.filter((_, other) => other !== index)
    const options = STANDARD_LANGUAGES.filter((language) => language !== "Common" && !taken.includes(language)).map((language) => {
      const speakers = SPECIES.find((species) => SPECIES_LANGUAGES[species.id]?.includes(language))
      return { id: language, name: language, line: speakers ? `Spoken by ${speakers.label}s.` : "A Standard Language.", source: "SRD 5.2.1 · p. 20" }
    })
    // The language the species is tied to is suggested, and counts as filled.
    return { id: `language-${index}`, kind: "language" as const, placeholder: "language", options, chosen: shown[index] ?? null }
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

// The slots the sentence writes. Size and the Goliath’s ancestry are suggested, not asked.
const inSentence = (slot: Slot) => slot.kind !== "size" && (slot.kind !== "lineage" || slot.named)
export const sentenceSlots = (slots: Slot[]) => slots.filter(inSentence)

// The open slots: those of the sentence not chosen yet, an approach suggestion included until it
// is accepted. Every open slot is in the sentence and nothing else is, so the caret, the picker,
// "To finish" and the review all read this.
export const openSlots = (slots: Slot[]) => sentenceSlots(slots).filter((slot) => slot.chosen === null)

// The one next slot to answer.
export const nextOpen = (slots: Slot[]) => openSlots(slots)[0] ?? null

export const chosenName = (slot: Slot) => slot.options.find((option) => option.id === slot.chosen)?.name ?? null
