import { cardsFor } from "./character-cards"
import type { GlossaryContext } from "./character-glossary"
import { origins, picksOf, toolGrants } from "./character-grants"
import { ABILITIES } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { NONE, signed } from "./quick-card-format"

// What the character is trained in, as text. `picks` are the panels that change skills, tools and languages.
export type ProficiencyModel = {
  saves: { label: string; proficient: boolean; bonus: string }[]
  tools: string[]
  languages: string[]
  armor: string
  weapons: string
  picks: { skills: string | null; tools: string | null; languages: string | null }
}

const MARTIAL = { all: "Martial", light: "Martial (Light)", "finesse-light": "Martial (Finesse or Light)" }

export function proficienciesOf(context: GlossaryContext): ProficiencyModel {
  const { cls } = origins(context)
  const build = cls ? CLASS_BUILD[cls.id] : null
  const weapons = build ? [build.weapons.simple && "Simple", build.weapons.martial && MARTIAL[build.weapons.martial]].filter(Boolean) : []
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
    picks: {
      skills: cls ? "class-skills" : null,
      tools: cardsFor(context).find((card) => card.decl.kind === "tools")?.decl.field ?? null,
      languages: cls ? "languages" : null,
    },
  }
}
