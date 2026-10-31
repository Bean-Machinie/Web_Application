import { readPicks, readStat } from "./character-values"
import { BACKGROUNDS, CLASSES, SPECIES } from "./character-templates/srd-5-2-1"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { isMagicInitiate } from "./character-templates/srd-5-2-1-feats"
import { LANGUAGES_TO_PICK } from "./character-templates/srd-5-2-1-gear"
import { BACKGROUND_KITS, CLASS_KITS } from "./character-templates/srd-5-2-1-kits"
import { APPROACHES } from "./character-templates/srd-5-2-1-quick"
import { INCREASE_OPTIONS } from "./character-templates/dnd-5e-2024-tables"
import { allowed, countOf, declsOf, repeats, without } from "./character-rules-checks"
import { NAME, NOUN, PICKS, SCORES, SILENT } from "./character-rules-names"
import { planQuickBuild } from "./quick-plan"
import { APPROACH_FIELD, CREATED_FIELD, markerOfField, RULES_FIELD } from "./quick-state"
import type { QuickRules } from "./quick-state"

// The one place that says what a change of class, species, lineage, background or approach does
// to the other picks. Suggested picks are recalculated from the new origins. Picks the player
// made are kept if still allowed, removed if not, and reopened if they became duplicates.

export type RuleState = {
  cls: string | null
  species: string | null
  background: string | null
  // The value stored under each field id.
  picks: Record<string, unknown>
  // The markers of what was suggested; null for a character the quick build did not make.
  suggested: string[] | null
  rules: QuickRules
}
export type RuleChange = Partial<{ cls: string; species: string; background: string; lineage: string; approach: string; rules: QuickRules; pick: { values: Record<string, unknown>; reset?: boolean } }>
export type RuleResult = {
  // The fields whose value changes, by field id; null clears.
  set: Record<string, unknown>
  suggested: string[] | null
  // What was taken away ("Fighting Style removed") and what must be picked again ("1 skill").
  removed: string[]
  reopened: string[]
  kits: { cls: string | null; background: string | null }
  // Strength and Dexterity once recalculated, for the attacks of the kits.
  modifiers: { str: number; dex: number } | null
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
const empty = (value: unknown) => value == null || (Array.isArray(value) && value.length === 0)

export function reconcile(state: RuleState, change: RuleChange): RuleResult {
  const out: Record<string, unknown> = { ...state.picks }
  const removed: string[] = []
  const reopened: string[] = []
  const touched = new Set<string>()
  const sugg = new Set(state.suggested ?? [])
  const isSuggested = (field: string) => sugg.has(markerOfField(field) ?? "")
  const picked = (field: string) => (isSuggested(field) ? [] : readPicks(out[field]))
  const note = (field: string, count: number) => reopened.push(`${count} ${NOUN[field]?.[count === 1 ? 0 : 1] ?? field}`)
  const drop = (field: string, label = NAME[field] ?? field) => {
    const had = !empty(out[field])
    out[field] = null
    if (had && !SILENT.includes(field)) removed.push(`${label} removed`)
  }
  // Fewer picks than before: the field is reopened, and no suggestion fills it.
  const shrink = (field: string, kept: string[]) => {
    const had = readPicks(out[field]).length
    out[field] = kept.length > 0 ? kept : null
    touched.add(field)
    if (had > kept.length && !SILENT.includes(field)) note(field, had - kept.length)
  }

  if (change.cls) out["character-class"] = change.cls
  if (change.species) out["species-choice"] = change.species
  if (change.background) out["background-choice"] = change.background
  if (change.lineage) {
    out["species-option"] = [change.lineage]
    sugg.delete("species-option")
  }
  if (change.approach) out[APPROACH_FIELD] = change.approach
  // Picks made in a panel are the player's own; "reset" gives them back to the suggestion.
  for (const [field, value] of Object.entries(change.pick?.values ?? {})) {
    out[field] = value
    const marker = markerOfField(field)
    if (!marker) continue
    if (change.pick?.reset) sugg.add(marker)
    else sugg.delete(marker)
  }
  const rules = change.rules ?? state.rules
  if (change.rules) out[RULES_FIELD] = change.rules
  const cls = CLASSES.find((option) => option.id === (change.cls ?? state.cls))
  const species = SPECIES.find((option) => option.id === (change.species ?? state.species))
  const background = BACKGROUNDS.find((option) => option.id === (change.background ?? state.background))
  if (change.cls && readStat(out.level) === null) out.level = 1

  // Picks made by hand: kept while the class, species or background still allows them.
  const decls = declsOf(cls, species, background)
  const order = readPicks(out["class-order"])[0]
  for (const field of PICKS) {
    const had = picked(field)
    if (had.length === 0) continue
    const decl = decls.get(field)
    if (!decl) drop(field)
    else shrink(field, had.filter((id) => allowed(decl, id, cls, order)).slice(0, countOf(decl)))
  }
  if (!isSuggested("size") && out.size != null && !(species?.sizeChoice && ["medium", "small"].includes(out.size as string))) drop("size")
  if (out[APPROACH_FIELD] != null && !APPROACHES[cls?.id ?? ""]?.some((option) => option.id === out[APPROACH_FIELD])) drop(APPROACH_FIELD)
  if (!isSuggested("ability-increase") && out["ability-increase"] != null && !INCREASE_OPTIONS[background?.id ?? ""]?.some((option) => option.id === out["ability-increase"])) {
    out["ability-increase"] = null
    note("ability-increase", 1)
  }
  for (const [field, kits] of [["equipment-class", cls && CLASS_KITS[cls.id]], ["equipment-background", background && BACKGROUND_KITS[background.id]]] as const) {
    if (!isSuggested(field) && out[field] != null && !kits?.some((kit) => kit.id === out[field])) drop(field)
  }

  // Held twice: the background's skills and tools win, then the class's, then the species'.
  const held = new Set(background?.skills ?? [])
  const heldTools = new Set([...(background && background.id !== "soldier" ? [background.tool] : []), ...(cls ? CLASS_BUILD[cls.id].tools : []), ...picked("background-tool")])
  for (const field of ["class-skills", "species-skill"]) {
    const kept = without(picked(field), held)
    if (kept.length < picked(field).length) shrink(field, kept)
    kept.forEach((id) => held.add(id))
  }
  const tools = without(picked("class-tools"), heldTools)
  if (tools.length < picked("class-tools").length) shrink("class-tools", tools)
  const feat = picked("species-feat")[0]
  if (feat && background && repeats(feat, [background.feat])) {
    drop("species-feat", "Versatile feat")
    drop("species-feat.ability")
  }

  // The suggestions, from the class, species and background as they now are.
  let modifiers: RuleResult["modifiers"] = null
  // Suggestions are stored as soon as the three origins are chosen.
  const complete = !!(cls && species && background)
  if (complete) {
    const fixed: Record<string, unknown> = {}
    for (const field of [...PICKS, "size", "languages", "skilled-picks", "species-feat.ability", "origin-feat.ability", "equipment-class", "equipment-background"]) {
      if (!isSuggested(field) && (!empty(out[field]) || touched.has(field))) fixed[field] = out[field] ?? []
    }
    if (!sugg.has("abilities") && !empty(out["ability-increase"])) fixed.abilities = true
    const plan = planQuickBuild(cls, species, background, rules, { approach: (out[APPROACH_FIELD] as string | null) ?? null, languages: picked("languages"), fixed })
    modifiers = plan.modifiers
    for (const [field, value] of Object.entries(plan.values)) {
      const marker = markerOfField(field)
      if (!marker || (!sugg.has(marker) && !(empty(out[field]) && !touched.has(field)))) continue
      out[field] = value
      sugg.add(marker)
    }
    if (!state.suggested || change.rules) out.level = rules.level
    if (rules.method === "own" && sugg.has("abilities")) for (const field of SCORES) out[field] = null
    // What was suggested and now has no suggestion is cleared.
    for (const marker of [...sugg].filter((key) => !plan.suggested.includes(key))) {
      for (const field of marker === "abilities" ? [...SCORES, "ability-increase"] : [marker]) out[field] = null
      sugg.delete(marker)
    }
  }

  // What depends on the picks above: Skilled needs the feat, Expertise needs the skills.
  const skilled = background?.feat === "Skilled" || readPicks(out["species-feat"]).includes("Skilled")
  if (picked("skilled-picks").length > 0 && !skilled) drop("skilled-picks")
  const skilledPicks = picked("skilled-picks")
  const skilledKept = skilledPicks.filter((id) => !(id.startsWith("skill:") ? held.has(id.slice(6)) : heldTools.has(id.slice(5)))).slice(0, 3)
  if (skilledKept.length < skilledPicks.length) shrink("skilled-picks", skilledKept)
  readPicks(out["skilled-picks"]).filter((id) => id.startsWith("skill:")).forEach((id) => held.add(id.slice(6)))
  for (const field of ["class-skills", "species-skill"]) readPicks(out[field]).forEach((id) => held.add(id))
  const expertise = picked("class-expertise")
  if (expertise.some((id) => !held.has(id))) shrink("class-expertise", expertise.filter((id) => held.has(id)))
  for (const field of ["species-feat.ability", "origin-feat.ability"]) {
    const feats = field === "origin-feat.ability" ? [background?.feat ?? ""] : readPicks(out["species-feat"])
    if (!isSuggested(field) && !empty(out[field]) && !feats.some(isMagicInitiate)) drop(field)
  }
  const count = LANGUAGES_TO_PICK + (cls ? CLASS_BUILD[cls.id].extraLanguages : 0)
  const languages = picked("languages")
  if (languages.length > count) {
    out.languages = languages.slice(0, count)
    removed.push(`${languages.length - count} extra ${languages.length - count === 1 ? "language" : "languages"} removed`)
  }

  // The character is a draft until Create is pressed.
  if (!state.suggested && complete && out[CREATED_FIELD] == null) out[CREATED_FIELD] = false
  const set: Record<string, unknown> = {}
  for (const field of Object.keys(out)) if (!same(out[field], state.picks[field])) set[field] = out[field] ?? null
  return {
    set,
    suggested: state.suggested || complete ? [...sugg] : null,
    removed,
    reopened,
    kits: { cls: (out["equipment-class"] as string | null) ?? null, background: (out["equipment-background"] as string | null) ?? null },
    modifiers,
  }
}

// Gives the picks of these fields back to the suggestion: clears them and marks them as suggested,
// so that reconcile fills each in again, as it would for a character the player had not touched.
export const resetToSuggested = (fields: string[]): RuleChange => ({
  pick: { values: Object.fromEntries(fields.map((field) => [field, null])), reset: true },
})

// What those fields would hold after the reset, by field id; null until the class, species and
// background are chosen, which is when suggestions are made. A field with no suggestion holds null.
export function suggestedValues(state: RuleState, fields: string[]) {
  if (!state.cls || !state.species || !state.background) return null
  const { set } = reconcile(state, resetToSuggested(fields))
  return Object.fromEntries(fields.map((field) => [field, field in set ? set[field] : (state.picks[field] ?? null)]))
}

// Whether a pick of the player's own is not what the suggestion would be: resetting would change it.
export function differsFromSuggested(state: RuleState, field: string) {
  const suggestion = suggestedValues(state, [field])?.[field]
  return !empty(suggestion) && !same(suggestion, state.picks[field])
}
