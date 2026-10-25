import { ABILITIES, BACKGROUNDS, CLASSES, SIZES, SPECIES } from "./character-templates/srd-5-2-1"
import { CLASS_NOTES, SPECIES_TRAITS } from "./character-templates/srd-5-2-1-glossary"

export type QuickKind = "class" | "species" | "background"

export const QUICK_KINDS: QuickKind[] = ["class", "species", "background"]

// What the start page and the option pages say for each kind, and the field it is stored in.
export const KIND_TEXT: Record<QuickKind, { noun: string; question: string; field: string }> = {
  class: { noun: "Class", question: "What kind of adventurer are you?", field: "character-class" },
  species: { noun: "Species", question: "Who are your ancestors?", field: "species-choice" },
  background: { noun: "Background", question: "How did you spend the years before adventuring?", field: "background-choice" },
}

export type QuickOption = {
  id: string
  name: string
  // One line from the SRD, under the name.
  line: string
  source: string
  // A picture for the card; none yet.
  image?: string
}

const sizeName = (id: string) => SIZES.find((size) => size.id === id)!.label
const abilityShort = (id: string) => ABILITIES.find(([other]) => other === id)![1].slice(0, 3)

// The species' size, Speed and Darkvision, as one line.
export const speciesLine = (species: (typeof SPECIES)[number]) =>
  [species.sizeChoice ? "Medium or Small" : sizeName(species.size), `${species.speed} ft`, species.darkvision ? `Darkvision ${species.darkvision} ft` : null].filter(Boolean).join(" · ")

const BY_KIND: Record<QuickKind, () => QuickOption[]> = {
  class: () =>
    CLASSES.map((option) => ({
      id: option.id,
      name: option.label,
      line: `d${option.hitDie} hit die · ${CLASS_NOTES[option.id].primary}`,
      source: `SRD 5.2.1 · p. ${option.page}`,
      image: option.image,
    })),
  species: () =>
    SPECIES.map((option) => ({
      id: option.id,
      name: option.label,
      line: speciesLine(option),
      source: `SRD 5.2.1 · p. ${SPECIES_TRAITS[option.id].page}`,
      image: option.image,
    })),
  background: () =>
    BACKGROUNDS.map((option) => ({
      id: option.id,
      name: option.label,
      line: `${option.abilities.map(abilityShort).join(", ")} · ${option.feat}`,
      source: "SRD 5.2.1 · p. 83",
      image: option.image,
    })),
}

export const optionsOf = (kind: QuickKind) => BY_KIND[kind]()

// The muted line on a filled card: "Level 1", "Medium · 30 ft", "Savage Attacker".
export function chosenLine(kind: QuickKind, id: string, level: number) {
  if (kind === "class") return `Level ${level}`
  if (kind === "species") {
    const species = SPECIES.find((option) => option.id === id)!
    return `${species.sizeChoice ? "Medium or Small" : sizeName(species.size)} · ${species.speed} ft`
  }
  return BACKGROUNDS.find((option) => option.id === id)!.feat
}
