import { chosenName, nextOpen } from "./quick-slots"
import type { Slot } from "./quick-slots"

// The sentence as it stands: words chosen, the plain text between them, and a caret where the
// next choice goes. It is written in order and stops at the open slot, so the caret is always last.
export type SentencePart =
  | { type: "text"; key: string; text: string }
  // `before` and `after` are the plain words around the slot; `text` is what goes in it, article
  // included. An open slot is a word with no text yet, or an option only being tried (`ghost`),
  // and becomes the chosen word under the same key.
  // `choices` is set when the word stands for two slots and asks which to change.
  | { type: "word"; key: string; slot: string; before: string; text: string; after: string; ghost: boolean; choices?: { slot: string; label: string }[] }
  // With a ghost before it the caret has no prompt, only the hint that the ghost is a suggestion.
  | { type: "caret"; key: string; slot: string; prompt: string; hint: string }

// The option shown at the caret: hovered or focused, else the suggested one.
export type Ghost = { slot: string; id: string; suggested: boolean }

// Words that start with a vowel but not the sound, and the other way round.
const A_BEFORE_VOWEL = /^(uni|use|usu|uti|eu|one|once)/i
const AN_BEFORE_H = /^(hour|honest|honou?r|heir)/i

export const article = (word: string) => (AN_BEFORE_H.test(word) || (/^[aeiou]/i.test(word) && !A_BEFORE_VOWEL.test(word)) ? "an" : "a")

// How a fighting approach reads in "I fight …".
const FIGHTS: Record<string, string> = { strength: "up close", dexterity: "with speed and finesse" }

const PROMPTS = {
  species: "choose your species",
  lineage: "choose your lineage",
  class: "choose your class",
  background: "choose your background",
  approach: "choose how you fight",
  language: "choose a language",
}

const CHANGE_EITHER = [
  { slot: "species", label: "Change species" },
  { slot: "lineage", label: "Change lineage" },
]

export function sentenceOf(slots: Slot[], ghost: Ghost | null = null): SentencePart[] {
  const parts: SentencePart[] = [{ type: "text", key: "im", text: "I’m" }]
  const open = nextOpen(slots)?.id ?? null
  const find = (id: string) => slots.find((slot) => slot.id === id)
  const nameOf = (slot: Slot, id: string) => slot.options.find((option) => option.id === id)?.name ?? id
  const withArticle = (text: string) => `${article(text)} ${text}`
  const word = (key: string, slot: string, before: string, text: string, after = "", ghosted = false, choices?: { slot: string; label: string }[]) =>
    parts.push({ type: "word", key, slot, before, text, after, ghost: ghosted, choices })
  const caret = (slot: string, prompt: string, hint = ""): SentencePart[] => [...parts, { type: "caret", key: `caret:${slot}`, slot, prompt, hint }]
  const hintOf = () => (ghost?.suggested ? "Tab to accept" : "")

  // One clause of a chosen slot. For the open slot it is the word with nothing in it, or its
  // ghost, and the caret after it. Null means it was written and the next clause follows. The
  // plain words before it never depend on the ghost, so nothing moves while options are tried.
  function clause(slot: Slot, prompt: string, before: string, textOf = (id: string) => nameOf(slot, id)) {
    if (open !== slot.id) return word(slot.id, slot.id, before, textOf(slot.chosen!)), null
    const tried = ghost?.slot === slot.id
    word(slot.id, slot.id, before, tried ? textOf(ghost.id) : "", "", true)
    return tried ? caret(slot.id, "", hintOf()) : caret(slot.id, prompt)
  }

  const species = find("species")!
  const lineage = find("lineage")?.named ? find("lineage")! : null
  const speciesText = (id: string) => withArticle(nameOf(species, id))
  if (open === species.id) return clause(species, PROMPTS.species, " ", speciesText)!
  // A lineage that names the species stands in for the species word, ghost included.
  const lineageOpen = !!lineage && open === lineage.id
  const lineageName = lineageOpen && ghost?.slot === lineage.id ? nameOf(lineage, ghost.id) : lineage?.chosen ? chosenName(lineage) : null
  const name = lineageName ?? chosenName(species)!
  word("species", lineageName ? lineage!.id : species.id, " ", withArticle(name), "", lineageOpen && !!lineageName, lineageName ? CHANGE_EITHER : undefined)
  if (lineageOpen) return ghost?.slot === lineage.id ? caret(lineage.id, "", hintOf()) : caret(lineage.id, PROMPTS.lineage)

  const approach = find("approach")
  const fights = (id: string) => FIGHTS[id] ?? nameOf(approach!, id).toLowerCase()
  const stopped =
    clause(find("class")!, PROMPTS.class, " ") ??
    clause(find("background")!, PROMPTS.background, ", once ", (id) => withArticle(nameOf(find("background")!, id))) ??
    (approach ? clause(approach, PROMPTS.approach, ". I fight ", fights) : null)
  if (stopped) return stopped

  // Common first, then the languages known, then the open slot. The last two of the list are
  // joined with "and", after a serial comma. A slot still to pick counts as one more word, tried
  // or not, so the words before the open slot read the same whichever option is shown.
  const languages = slots.filter((slot) => slot.kind === "language")
  const known = languages.filter((slot) => slot.chosen)
  const next = languages.find((slot) => slot.id === open)
  const more = !!next && languages.some((slot) => !slot.chosen && slot !== next)
  const total = 1 + known.length + (next ? 1 : 0) + (more ? 1 : 0)
  const joiner = (position: number) => (position === 1 ? ". I speak Common" : "") + (position === total - 1 ? (total === 2 ? " and " : ", and ") : ", ")
  known.forEach((slot, index) => word(slot.id, slot.id, joiner(index + 1), slot.chosen!, !next && index === known.length - 1 ? "." : ""))
  if (!next) return parts
  const tried = ghost?.slot === next.id
  word(next.id, next.id, joiner(known.length + 1), tried ? nameOf(next, ghost.id) : "", tried && !more ? "." : "", true)
  return tried ? caret(next.id, "", hintOf()) : caret(next.id, PROMPTS.language)
}
