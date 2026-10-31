import { featGrants, origins, picksOf } from "./character-grants"
import type { GlossaryContext } from "./character-glossary"
import { isMagicInitiate } from "./character-templates/srd-5-2-1-feats"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import type { ChoiceDecl } from "./character-templates/srd-5-2-1-choices"
import { LANGUAGES_TO_PICK } from "./character-templates/srd-5-2-1-gear"
import { ABILITY_OPTIONS, BACKGROUND_CHOICES, SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"

// One thing to choose for the character: what it is, who asks for it, what has
// been picked, and whether that is enough.
export type Card = { decl: ChoiceDecl; source: string; chosen: string[]; done: boolean; remaining: number }

const abilityOf = (field: string): ChoiceDecl => ({ kind: "options", field, title: "Spellcasting ability", count: 1, options: ABILITY_OPTIONS })

// Every choice the current class, background, species and feats ask for. Each class,
// background and species declares its own (the srd-5-2-1 data files), so this only
// gathers them, and adds the ones that follow from a feat: Magic Initiate’s spellcasting
// ability and Skilled’s picks, and the two languages.
export function cardsFor(context: GlossaryContext): Card[] {
  const { cls, background, species } = origins(context)
  const entries: { decl: ChoiceDecl; source: string }[] = []
  const add = (decls: ChoiceDecl[], source: string) => decls.forEach((decl) => entries.push({ decl, source }))

  if (cls) {
    const skills: ChoiceDecl = { kind: "skills", field: "class-skills", title: "Skills", count: cls.skillCount, from: cls.skills ?? "any" }
    add([skills, ...CLASS_BUILD[cls.id].choices], cls.label)
  }
  if (species) add(SPECIES_CHOICES[species.id] ?? [], species.label)
  if (background) add(BACKGROUND_CHOICES[background.id] ?? [], background.label)

  // What the feats held bring with them.
  const feats = featGrants(context)
  for (const grant of feats) {
    if (isMagicInitiate(grant.id)) add([abilityOf(`${grant.slot}.ability`)], `${grant.id} · ${grant.source}`)
  }
  if (feats.some((grant) => grant.id === "Skilled")) {
    add([{ kind: "skilled", field: "skilled-picks", title: "Skilled", count: 3 }], "Skilled")
  }
  const extra = cls ? CLASS_BUILD[cls.id].extraLanguages : 0
  entries.push({ decl: { kind: "languages", field: "languages", title: "Languages", count: LANGUAGES_TO_PICK + extra }, source: "Everyone" })

  return entries.map(({ decl, source }) => {
    const chosen = picksOf(context, decl.field)
    const count = decl.kind === "feat" ? 1 : decl.count
    return { decl, source, chosen, done: chosen.length >= count, remaining: Math.max(count - chosen.length, 0) }
  })
}

export const pendingCards = (cards: Card[]) => cards.filter((card) => !card.done)
