import { featGrants, fromOthers, origins, picksOf, skillGrants, toolGrants } from "./character-grants"
import type { GlossaryContext } from "./character-glossary"
import { allowed } from "./character-rules-checks"
import { SKILLS } from "./character-templates/srd-5-2-1"
import type { ChoiceDecl } from "./character-templates/srd-5-2-1-choices"
import { featsOf } from "./character-templates/srd-5-2-1-feats"
import { ARTISAN_TOOLS, GAMING_SETS, MASTERY_NOTES, MUSICAL_INSTRUMENTS, OTHER_TOOLS, STANDARD_LANGUAGES, WEAPONS } from "./character-templates/srd-5-2-1-gear"
import { RECOMMENDED_EXPERTISE } from "./character-templates/srd-5-2-1-quick"

// One option of a pick, as the panels show it. `disabled` is the reason it cannot be taken, such
// as "From Criminal".
export type PickOption = { id: string; label: string; note?: string; recommended?: boolean; disabled?: string; group?: string }

const from = (source: string | undefined) => (source ? `From ${source}` : undefined)

// The options of a pick and which of them another source holds already, from the same grants
// the rules use, so a pick is never wasted on what the character has.
export function pickOptions(context: GlossaryContext, decl: ChoiceDecl): PickOption[] {
  const { cls } = origins(context)
  const heldSkill = fromOthers(skillGrants(context), decl.field)
  const heldTool = fromOthers(toolGrants(context), decl.field)
  const skill = (id: string, label: string, note?: string, group?: string): PickOption => ({
    id: group ? `skill:${id}` : id,
    label,
    note,
    group,
    disabled: from(heldSkill.find((grant) => grant.id === id)?.source),
  })
  const tool = (name: string, group?: string): PickOption => ({ id: group ? `tool:${name}` : name, label: name, group, disabled: from(heldTool.find((grant) => grant.id === name)?.source) })

  switch (decl.kind) {
    case "skills":
      return SKILLS.filter(([id]) => decl.from === "any" || decl.from.includes(id)).map(([id, label, ability]) => skill(id, label, ability.toUpperCase()))
    case "tools":
      return decl.from.map((name) => tool(name))
    case "feat": {
      const held = fromOthers(featGrants(context), decl.field)
      return featsOf(decl.category).map((feat) => {
        const source = held.find((grant) => grant.id === feat.id)?.source
        const reason = feat.spellList ? `Already from ${source}. Choose a different spell list.` : `Already from ${source}. A feat can be taken only once.`
        return { id: feat.id, label: feat.label, note: feat.benefit, recommended: feat.id === decl.recommended, disabled: source && !feat.repeatable ? reason : undefined }
      })
    }
    case "weapons": {
      const order = picksOf(context, "class-order")[0]
      return WEAPONS.filter((weapon) => allowed(decl, weapon.id, cls ?? undefined, order)).map((weapon) => ({ id: weapon.id, label: `${weapon.label} · ${weapon.mastery}`, note: MASTERY_NOTES[weapon.mastery] }))
    }
    case "expertise":
      return SKILLS.filter(([id]) => (context.derived[`skill.${id}.prof`] ?? 0) > 0).map(([id, label]) => ({ id, label, recommended: RECOMMENDED_EXPERTISE.includes(id) }))
    case "options":
      return decl.options.map((option) => ({ id: option.id, label: option.label, note: option.note }))
    case "languages":
      return STANDARD_LANGUAGES.filter((language) => language !== "Common").map((language) => ({ id: language, label: language }))
    case "skilled":
      return [...SKILLS.map(([id, label]) => skill(id, label, undefined, "Skills")), ...[...ARTISAN_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS, ...OTHER_TOOLS].map((name) => tool(name, "Tools"))]
    default:
      return []
  }
}
