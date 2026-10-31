import { cardsFor } from "./character-cards"
import { joinList } from "./character-format"
import type { GlossaryContext } from "./character-glossary"
import { origins } from "./character-grants"
import type { ChoiceDecl } from "./character-templates/srd-5-2-1-choices"
import { MASTERY_NOTES } from "./character-templates/srd-5-2-1-gear"

// What the pick panel needs to frame one pick: its name, who asks for it (the pill), one line of
// explanation, and, for a pick from a list, what it is declared as.
export type PickInfo = { key: string; title: string; source: string; help: string; decl: ChoiceDecl | null }

// Picks that are not a list of options.
const SPECIAL: Record<string, { title: string; help: string }> = {
  equipment: { title: "Equipment", help: "Your class and background each offer a ready-made kit, or gold to buy your own." },
  "origin-feat": { title: "Origin feat", help: "The feat your background gives." },
  size: { title: "Size", help: "Medium or Small, your choice." },
  details: { title: "Details", help: "Concept, alignment and the backstory questions. Nothing here is chosen for you." },
}

// The panel a marker or field of the review opens: both kits are one panel.
export const pickKeyOf = (key: string) => (key.startsWith("equipment") ? "equipment" : key)

// The address query that opens the builder where a pick is changed: its panel, or for the ability
// scores their workspace.
export const pickQuery = (key: string) => (key === "abilities" ? "workspace=abilities" : `pick=${pickKeyOf(key)}`)

function helpFor(decl: ChoiceDecl) {
  const count = "count" in decl ? decl.count : 1
  if (decl.kind === "skills") return decl.from === "any" ? "One skill of your choice." : `Pick ${count} from the list. You add your Proficiency Bonus to checks with them.`
  if (decl.kind === "weapons") return `Pick ${count} kinds of weapons. Each adds its mastery effect when you hit (${Object.keys(MASTERY_NOTES).join(", ")}).`
  if (decl.kind === "expertise") return "Double your Proficiency Bonus on skills you are proficient in. Sleight of Hand and Stealth are recommended."
  if (decl.kind === "tools") return `You are proficient with ${count > 1 ? "them" : "it"}.`
  if (decl.kind === "languages") return `You know Common, plus ${count} standard ${count > 1 ? "languages" : "language"}.`
  if (decl.kind === "skilled") return "Proficiency in any combination of three skills or tools."
  if (decl.kind === "feat") return "Pick one origin feat."
  return `Pick ${count}.`
}

export function pickInfo(context: GlossaryContext, key: string): PickInfo | null {
  const { cls, species, background } = origins(context)
  if (key === "size" && !species?.sizeChoice) return null
  const special = SPECIAL[key]
  if (special) {
    const sources: Record<string, string | undefined> = {
      "origin-feat": background?.label,
      size: species?.label,
      equipment: joinList([cls?.label, background?.label].filter((label): label is string => !!label)),
    }
    return { key, ...special, source: sources[key] ?? "", decl: null }
  }
  const card = cardsFor(context).find((candidate) => candidate.decl.field === key)
  return card ? { key, title: card.decl.title, source: card.source, help: helpFor(card.decl), decl: card.decl } : null
}
