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
export type Slot = { id: string; kind: SlotKind; placeholder: string; options: QuickOption[]; chosen: string | null }

const SIZE_OPTIONS: QuickOption[] = [
  { id: "medium", name: "Medium", line: "About 4–7 ft tall.", source: "SRD 5.2.1 · Species" },
  { id: "small", name: "Small", line: "About 2–4 ft tall.", source: "SRD 5.2.1 · Species" },
]

function lineageSlot(view: QuickView): Slot | null {
  const decl = SPECIES_CHOICES[view.species ?? ""]?.find((candidate) => candidate.kind === "options" && candidate.field === "species-option")
  if (decl?.kind !== "options") return null
  const source = `SRD 5.2.1 · p. ${SPECIES_TRAITS[view.species!].page}`
  const options = decl.options.map((option) => ({ id: option.id, name: option.label, line: option.note ?? "", source }))
  return { id: "lineage", kind: "lineage", placeholder: decl.title.toLowerCase(), options, chosen: view.lineage }
}

function approachSlot(view: QuickView): Slot | null {
  const options = APPROACHES[view.cls ?? ""]
  if (!options) return null
  const list = options.map((option) => ({ id: option.id, name: option.label, line: option.line, source: "Quick build suggestion" }))
  // The first is the default, so the sentence is never left open on it.
  return { id: "approach", kind: "approach", placeholder: "how", options: list, chosen: options.find((option) => option.id === view.approach)?.id ?? options[0].id }
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
    ...extra(approachSlot(view)),
    main("background", view.background),
    ...languageSlots(view),
  ]
}

// The next slot to open after a choice: the first one still empty. Languages are optional.
export const nextEmpty = (slots: Slot[]) => slots.find((slot) => slot.chosen === null && slot.kind !== "language")?.id ?? null

export const chosenName = (slot: Slot) => slot.options.find((option) => option.id === slot.chosen)?.name ?? null
