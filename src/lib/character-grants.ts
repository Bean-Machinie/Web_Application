import { choiceState } from "./character-choices"
import type { GlossaryContext } from "./character-glossary"
import { BACKGROUNDS, CLASSES, SPECIES } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { readPicks } from "./character-values"

// What the character already has, and from which source, so a skill, tool or feat is not
// taken twice. `slot` is the field the grant is stored in, to leave a choice’s own out.
export type Grant = { slot: string; id: string; source: string }

export const picksOf = (context: GlossaryContext, field: string) => readPicks(context.values[field]?.value)

export function chosenOption(context: GlossaryContext, fieldId: string) {
  const field = context.byId.get(fieldId)
  return field ? (choiceState(field, context.byId, context.derived).selected ?? null) : null
}

// The class, background and species chosen.
export function origins(context: GlossaryContext) {
  const id = (field: string) => chosenOption(context, field)?.id
  return {
    cls: CLASSES.find((candidate) => candidate.id === id("character-class")) ?? null,
    background: BACKGROUNDS.find((candidate) => candidate.id === id("background-choice")) ?? null,
    species: SPECIES.find((candidate) => candidate.id === id("species-choice")) ?? null,
  }
}

export function skillGrants(context: GlossaryContext): Grant[] {
  const { cls, background, species } = origins(context)
  const from = (slot: string, source: string | undefined, ids: string[]) =>
    source ? ids.map((id) => ({ slot, id, source })) : []
  return [
    ...from("background", background?.label, background?.skills ?? []),
    ...from("class-skills", cls?.label, picksOf(context, "class-skills")),
    ...from("species-skill", species?.label, picksOf(context, "species-skill")),
    ...from("skilled-picks", "Skilled", picksOf(context, "skilled-picks").filter((id) => id.startsWith("skill:")).map((id) => id.slice(6))),
  ]
}

export function toolGrants(context: GlossaryContext): Grant[] {
  const { cls, background } = origins(context)
  const from = (slot: string, source: string | undefined, ids: string[]) =>
    source ? ids.map((id) => ({ slot, id, source })) : []
  const backgroundFixed = background && background.id !== "soldier" ? [background.tool] : []
  return [
    ...from("background", background?.label, backgroundFixed),
    ...from("background-tool", background?.label, picksOf(context, "background-tool")),
    ...from("class-fixed", cls?.label, cls ? CLASS_BUILD[cls.id].tools : []),
    ...from("class-tools", cls?.label, picksOf(context, "class-tools")),
    ...from("skilled-picks", "Skilled", picksOf(context, "skilled-picks").filter((id) => id.startsWith("tool:")).map((id) => id.slice(5))),
  ]
}

// Feats held: the background’s, the Human’s Versatile, the Fighter’s Fighting Style.
export function featGrants(context: GlossaryContext): Grant[] {
  const { cls, background, species } = origins(context)
  const feat = chosenOption(context, "origin-feat")
  return [
    ...(background && feat ? [{ slot: "origin-feat", id: feat.id, source: background.label }] : []),
    ...picksOf(context, "species-feat").map((id) => ({ slot: "species-feat", id, source: species?.label ?? "Species" })),
    ...picksOf(context, "class-style").map((id) => ({ slot: "class-style", id, source: cls?.label ?? "Class" })),
  ]
}

// The grants of other slots only, for a choice that must not repeat them.
export const fromOthers = (grants: Grant[], slot: string) => grants.filter((grant) => grant.slot !== slot)
