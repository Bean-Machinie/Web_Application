import { chosenName } from "./quick-slots"
import type { Slot } from "./quick-slots"
import type { QuickView } from "./quick-view"

// The sentence as it stands: words chosen, the plain text between them, and a caret where the
// next choice goes. It is written one clause at a time; a clause is there once it is chosen.
export type SentencePart =
  | { type: "text"; key: string; text: string }
  // `before` and `after` are the plain words around the chosen one, which type in with it.
  | { type: "word"; key: string; slot: string; before: string; text: string; after: string }
  | { type: "caret"; key: string; slot: string; lead: string; prompt: string }

// Words that start with a vowel but not the sound, and the other way round.
const A_BEFORE_VOWEL = /^(uni|use|usu|uti|eu|one|once)/i
const AN_BEFORE_H = /^(hour|honest|honou?r|heir)/i

export const article = (word: string) => (AN_BEFORE_H.test(word) || (/^[aeiou]/i.test(word) && !A_BEFORE_VOWEL.test(word)) ? "an" : "a")

// How a fighting approach reads in "I fight …".
const FIGHTS: Record<string, string> = { strength: "up close", dexterity: "with speed and finesse" }

const PROMPTS: Record<string, string> = {
  species: "choose your species",
  size: "choose your size",
  class: "choose your class",
  background: "choose your background",
  approach: "choose how you fight",
  language: "choose a language",
}

// A lineage replaces the species word when it says the species already ("Forest Gnome", and
// "Drow" for an Elf); otherwise it leads it ("Black Dragonborn").
function speciesWord(species: string, lineage: string | null, lineageId: string | null) {
  if (!lineage) return species
  return lineageId === "drow" || lineage.toLowerCase().includes(species.toLowerCase()) ? lineage : `${lineage} ${species}`
}

export function sentenceOf(slots: Slot[], view: QuickView): SentencePart[] {
  const parts: SentencePart[] = [{ type: "text", key: "im", text: "I’m" }]
  const find = (id: string) => slots.find((slot) => slot.id === id)
  let waiting = false
  // The first word of the opening takes the article: "a small Human", "an Elf".
  let opened = false

  const word = (key: string, slot: string, before: string, text: string, after = "") => parts.push({ type: "word", key, slot, before, text, after })
  const opening = (text: string) => {
    const before = opened ? " " : ` ${article(text)} `
    opened = true
    return before
  }
  const wait = (slot: Slot, lead: string) => {
    if (waiting) return
    waiting = true
    parts.push({ type: "caret", key: "caret", slot: slot.id, lead, prompt: PROMPTS[slot.kind] ?? `choose your ${slot.placeholder}` })
  }

  const species = find("species")!
  const size = find("size")
  const lineage = find("lineage")
  if (size?.chosen) {
    const text = chosenName(size)!.toLowerCase()
    word("size", "size", opening(text), text)
  }
  if (species.chosen) {
    const picked = lineage?.chosen ? chosenName(lineage) : null
    const text = speciesWord(chosenName(species)!, picked, lineage?.chosen ?? null)
    word("species", picked ? "lineage" : "species", opening(text), text)
  }
  const pending = [species, size, lineage].find((slot) => slot && !slot.chosen)
  if (pending) wait(pending, " ")

  const cls = find("class")!
  if (cls.chosen) {
    const text = chosenName(cls)!
    word("class", "class", opening(text), text, ",")
  } else wait(cls, " ")

  const background = find("background")!
  if (background.chosen) {
    const text = chosenName(background)!
    word("background", "background", ` once ${article(text)} `, text, ".")
  } else wait(background, " once ")

  const approach = find("approach")
  if (approach && view.approach) {
    const text = FIGHTS[approach.chosen!] ?? chosenName(approach)!.toLowerCase()
    word("approach", "approach", " I fight ", text, ".")
  } else if (approach) wait(approach, " I fight ")

  // Suggested languages count as written once the clauses before them are; the clause also
  // stays once the player has picked their own.
  const languages = slots.filter((slot) => slot.kind === "language")
  if (!waiting || view.languages.length > 0) {
    languages.forEach((slot, index) => {
      const last = index === languages.length - 1
      const before = index === 0 ? " I speak Common, " : last ? " and " : ", "
      if (slot.chosen) word(slot.id, slot.id, before, slot.chosen, last ? "." : "")
      else wait(slot, before)
    })
  }
  return parts
}
