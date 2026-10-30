import { splitIncreaseId } from "./character-templates/dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP, SKILLS, STANDARD_ARRAY_BY_CLASS } from "./character-templates/srd-5-2-1"
import type { AbilityId, SrdBackground, SrdClass, SrdSpecies } from "./character-templates/srd-5-2-1"
import type { Kit } from "./character-templates/srd-5-2-1-choices"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { BACKGROUND_KITS, CLASS_KITS } from "./character-templates/srd-5-2-1-kits"
import { isMagicInitiate } from "./character-templates/srd-5-2-1-feats"
import { BACKGROUND_CHOICES, SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"
import { APPROACHES, RECOMMENDED_EXPERTISE, SPECIES_LANGUAGES, SUGGESTED_SKILLS } from "./character-templates/srd-5-2-1-quick"
import { proficientWith } from "./character-weapons"
import type { QuickRules } from "./quick-state"

// What the player already chose, which the plan leaves alone. `fixed` has the picks made by
// hand, by field id (and "abilities" for the scores and the increase); the plan holds what they
// take, so a suggestion never repeats one.
export type QuickChosen = { approach: string | null; languages: string[]; fixed?: Record<string, unknown> }

// Everything the quick build fills in for a class, species and background: the values to
// store under their field ids, the markers to put on them, and the two kits.
export type QuickPlan = {
  values: Record<string, unknown>
  suggested: string[]
  classKit: Kit
  backgroundKit: Kit
  // Strength and Dexterity once the increase is added, for the kits' attacks.
  modifiers: { str: number; dex: number }
}

// p. 83: +2 to the class's primary ability if the background lists it, else to the highest
// it lists; +1 to the next highest it lists. "Highest" is by the class's suggested scores.
function suggestIncrease(background: SrdBackground, scores: Record<AbilityId, number>, primaryOf: AbilityId[]) {
  const listed = [...background.abilities].sort((a, b) => scores[b] - scores[a])
  const primary = primaryOf.filter((id) => background.abilities.includes(id)).sort((a, b) => scores[b] - scores[a])[0]
  const two = primary ?? listed[0]
  return { two, one: listed.find((id) => id !== two)! }
}

const modifier = (score: number) => Math.floor((score - 10) / 2)

// The first `count` of `order` that are not taken yet, which are then taken.
function take(order: string[], taken: Set<string>, count: number) {
  const picked = order.filter((id) => !taken.has(id)).slice(0, count)
  picked.forEach((id) => taken.add(id))
  return picked
}

// Weapons in the starting kits that the class can master, class kit first.
function masteries(cls: SrdClass, count: number, rule: "melee" | "any" | "proficient", kits: Kit[]) {
  const ids = [...new Set(kits.flatMap((kit) => kit.items.flatMap((item) => (item.weapon ? [item.weapon] : []))))]
  return ids
    .filter((id) => {
      const weapon = weaponById(id)
      if (!weapon) return false
      return rule === "any" || (rule === "melee" ? !weapon.ranged : proficientWith(CLASS_BUILD[cls.id], weapon, undefined))
    })
    .slice(0, count)
}

const SKILL_PICKS = ["class-skills", "species-skill"]
const skillOf = (id: string) => id.replace("skill:", "")

export function planQuickBuild(cls: SrdClass, species: SrdSpecies, background: SrdBackground, rules: QuickRules, chosen: QuickChosen): QuickPlan {
  const values: Record<string, unknown> = { level: rules.level }
  const fixed = chosen.fixed ?? {}
  const set = (field: string, value: unknown) => {
    if (!(field in fixed)) values[field] = value
  }
  const approach = APPROACHES[cls.id]?.find((option) => option.id === chosen.approach) ?? APPROACHES[cls.id]?.[0]
  const classKit = CLASS_KITS[cls.id].find((kit) => kit.id === approach?.kit) ?? CLASS_KITS[cls.id][0]
  const backgroundKit = BACKGROUND_KITS[background.id][0]
  set("equipment-class", classKit.id)
  set("equipment-background", backgroundKit.id)

  // The approach's ability gets the class's best score, swapped from the primary that had it.
  const scores = { ...STANDARD_ARRAY_BY_CLASS[cls.id] }
  const lead = approach ? [...cls.primary].sort((a, b) => scores[b] - scores[a])[0] : null
  if (approach && lead && lead !== approach.ability && scores[approach.ability] < scores[lead]) {
    ;[scores[lead], scores[approach.ability]] = [scores[approach.ability], scores[lead]]
  }
  const { two, one } = suggestIncrease(background, scores, approach ? [approach.ability] : cls.primary)
  if (!("abilities" in fixed)) {
    values["ability-increase"] = splitIncreaseId(two, one)
    if (rules.method !== "own") for (const [id] of ABILITIES) values[id] = scores[id]
  }
  const total = (id: AbilityId) => Math.min(ABILITY_CAP, scores[id] + (id === two ? 2 : id === one ? 1 : 0))

  // Skills in the order they are asked for, none of them held twice, those picked by hand included.
  const taken = new Set([...background.skills, ...SKILL_PICKS.flatMap((field) => (fixed[field] as string[] | undefined) ?? []), ...(((fixed["skilled-picks"] as string[] | undefined) ?? []).filter((id) => id.startsWith("skill:")).map(skillOf))])
  const classSkills = cls.skills ?? SKILLS.map(([id]) => id)
  const preferred = [...SUGGESTED_SKILLS[cls.id].filter((id) => classSkills.includes(id)), ...classSkills]
  set("class-skills", take(preferred, taken, cls.skillCount))
  // Tools likewise: the background's, the class's, and the Skilled picks.
  const tools = new Set([...(background.id === "soldier" ? [] : [background.tool]), ...CLASS_BUILD[cls.id].tools, ...(((fixed["skilled-picks"] as string[] | undefined) ?? []).filter((id) => id.startsWith("tool:")).map((id) => id.slice(5)))])
  const speciesDecls = SPECIES_CHOICES[species.id] ?? []
  for (const decl of speciesDecls) {
    if (decl.kind === "skills") set(decl.field, take(decl.from === "any" ? preferred : [...decl.from].sort((a, b) => preferred.indexOf(a) - preferred.indexOf(b)), taken, decl.count))
    if (decl.kind === "feat" && decl.recommended) set(decl.field, [decl.recommended])
    // The sentence asks for a lineage that names the species; the others are suggested.
    if (decl.kind === "options" && !decl.options.some((option) => option.lineage)) set(decl.field, [decl.options[0].id])
  }
  if (species.sizeChoice) set("size", "medium")
  const speciesFeat = ((fixed["species-feat"] ?? values["species-feat"]) as string[] | undefined)?.[0]
  const feats = [background.feat, ...(speciesFeat ? [speciesFeat] : [])]
  if (feats.includes("Skilled")) set("skilled-picks", take([...preferred, ...SKILLS.map(([id]) => id)], taken, 3).map((id) => `skill:${id}`))
  // A Magic Initiate feat asks for its spellcasting ability: the class's, or Intelligence.
  const ability = ["int", "wis", "cha"].includes(cls.spellAbility ?? "") ? cls.spellAbility : "int"
  if (isMagicInitiate(background.feat)) set("origin-feat.ability", [ability])
  if (speciesFeat && isMagicInitiate(speciesFeat)) set("species-feat.ability", [ability])

  for (const decl of [...CLASS_BUILD[cls.id].choices, ...(BACKGROUND_CHOICES[background.id] ?? [])]) {
    if (decl.kind === "feat" && decl.recommended) set(decl.field, [approach?.style ?? decl.recommended])
    if (decl.kind === "weapons") set(decl.field, masteries(cls, decl.count, decl.rule, [classKit, backgroundKit]))
    if (decl.kind === "expertise" && RECOMMENDED_EXPERTISE.every((id) => taken.has(id))) set(decl.field, RECOMMENDED_EXPERTISE)
    if (decl.kind === "options") set(decl.field, [decl.options[0].id])
    if (decl.kind === "tools") set(decl.field, take(decl.from, tools, decl.count))
  }

  // Languages the species is tied to, unless the player picked their own.
  if (chosen.languages.length === 0) set("languages", SPECIES_LANGUAGES[species.id] ?? [])

  // Only what was filled in is marked; an empty pick is left to finish.
  const suggested = Object.keys(values).filter((field) => field !== "level" && !(Array.isArray(values[field]) && (values[field] as unknown[]).length === 0))
  const marked = suggested.map((field) => (ABILITIES.some(([id]) => id === field) || field === "ability-increase" ? "abilities" : field))
  return { values, suggested: [...new Set(marked)], classKit, backgroundKit, modifiers: { str: modifier(total("str")), dex: modifier(total("dex")) } }
}
