import { cardsFor } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { origins, picksOf, toolGrants } from "./character-grants"
import { ABILITIES } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { differsFromSuggested } from "./character-rules"
import { ruleStateOf } from "./character-rules-state"
import { NONE, signed } from "./quick-card-format"
import { readSuggested } from "./quick-state"

// What the character is trained in, as text. `picks` are the panels that change skills, tools and languages.
export type ProficiencyModel = {
  saves: { label: string; proficient: boolean; bonus: string }[]
  tools: string[]
  languages: string[]
  armor: string
  weapons: string
  picks: { skills: string | null; tools: string | null; languages: string | null }
  // The tools or languages are the player's own and not the suggestion, so they can be given back to it.
  resettable: { tools: boolean; languages: boolean }
}

const MARTIAL = { all: "Martial", light: "Martial (Light)", "finesse-light": "Martial (Finesse or Light)" }

export function proficienciesOf(context: GlossaryContext): ProficiencyModel {
  const { cls } = origins(context)
  const build = cls ? CLASS_BUILD[cls.id] : null
  const state = ruleStateOf(context)
  const suggested = readSuggested(context.values)
  const held = (field: string) => (Array.isArray(state.picks[field]) ? (state.picks[field] as unknown[]).length > 0 : state.picks[field] != null)
  const own = (field: string | null) => field !== null && held(field) && !suggested.includes(field) && differsFromSuggested(state, field)
  const weapons = build ? [build.weapons.simple && "Simple", build.weapons.martial && MARTIAL[build.weapons.martial]].filter(Boolean) : []
  const picks = {
    skills: cls ? "class-skills" : null,
    tools: cardsFor(context).find((card) => card.decl.kind === "tools")?.decl.field ?? null,
    languages: cls ? "languages" : null,
  }
  return {
    saves: ABILITIES.map(([id, label]) => ({
      label,
      proficient: (context.derived[`save.${id}.prof`] ?? 0) > 0,
      bonus: cls ? signed(context.derived[`save.${id}`]) : NONE,
    })),
    tools: [...new Set(toolGrants(context).map((grant) => grant.id))],
    languages: cls ? ["Common", ...picksOf(context, "languages")] : [],
    armor: build?.armor ?? NONE,
    weapons: weapons.join(", ") || NONE,
    picks,
    resettable: { tools: own(picks.tools), languages: own(picks.languages) },
  }
}
