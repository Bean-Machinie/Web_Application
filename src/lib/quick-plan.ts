import { splitIncreaseId } from "./character-templates/dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP, SKILLS, STANDARD_ARRAY_BY_CLASS } from "./character-templates/srd-5-2-1"
import type { AbilityId, SrdBackground, SrdClass, SrdSpecies } from "./character-templates/srd-5-2-1"
import type { Kit } from "./character-templates/srd-5-2-1-choices"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { weaponById } from "./character-templates/srd-5-2-1-gear"
import { BACKGROUND_KITS, CLASS_KITS } from "./character-templates/srd-5-2-1-kits"
import { SPECIES_CHOICES } from "./character-templates/srd-5-2-1-origins"
import { APPROACHES, RECOMMENDED_EXPERTISE, SPECIES_LANGUAGES, SUGGESTED_SKILLS } from "./character-templates/srd-5-2-1-quick"
import { proficientWith } from "./character-weapons"
import type { QuickRules } from "./quick-state"

// What the player already chose on the start page, which the plan leaves alone.
export type QuickChosen = { approach: string | null; languages: string[] }

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

export function planQuickBuild(cls: SrdClass, species: SrdSpecies, background: SrdBackground, rules: QuickRules, chosen: QuickChosen): QuickPlan {
  const values: Record<string, unknown> = { level: rules.level }
  const approach = APPROACHES[cls.id]?.find((option) => option.id === chosen.approach) ?? APPROACHES[cls.id]?.[0]
  const classKit = CLASS_KITS[cls.id].find((kit) => kit.id === approach?.kit) ?? CLASS_KITS[cls.id][0]
  const backgroundKit = BACKGROUND_KITS[background.id][0]
  Object.assign(values, { "equipment-class": classKit.id, "equipment-background": backgroundKit.id })

  // The approach's ability gets the class's best score, swapped from the primary that had it.
  const scores = { ...STANDARD_ARRAY_BY_CLASS[cls.id] }
  const lead = approach ? [...cls.primary].sort((a, b) => scores[b] - scores[a])[0] : null
  if (approach && lead && lead !== approach.ability && scores[approach.ability] < scores[lead]) {
    ;[scores[lead], scores[approach.ability]] = [scores[approach.ability], scores[lead]]
  }
  const { two, one } = suggestIncrease(background, scores, approach ? [approach.ability] : cls.primary)
  values["ability-increase"] = splitIncreaseId(two, one)
  if (rules.method !== "own") for (const [id] of ABILITIES) values[id] = scores[id]
  const total = (id: AbilityId) => Math.min(ABILITY_CAP, scores[id] + (id === two ? 2 : id === one ? 1 : 0))

  // Skills in the order they are asked for, none of them held twice.
  const taken = new Set(background.skills)
  const own = (cls.skills ?? SKILLS.map(([id]) => id))
  const preferred = [...SUGGESTED_SKILLS[cls.id].filter((id) => own.includes(id)), ...own]
  values["class-skills"] = take(preferred, taken, cls.skillCount)
  const speciesDecls = SPECIES_CHOICES[species.id] ?? []
  for (const decl of speciesDecls) {
    if (decl.kind === "skills") values[decl.field] = take(decl.from === "any" ? preferred : [...decl.from].sort((a, b) => preferred.indexOf(a) - preferred.indexOf(b)), taken, decl.count)
    if (decl.kind === "feat" && decl.recommended) values[decl.field] = [decl.recommended]
  }
  const feats = [background.feat, ...(speciesDecls.flatMap((decl) => (decl.kind === "feat" && decl.recommended ? [decl.recommended] : [])))]
  if (feats.includes("Skilled")) values["skilled-picks"] = take([...preferred, ...SKILLS.map(([id]) => id)], taken, 3).map((id) => `skill:${id}`)

  for (const decl of CLASS_BUILD[cls.id].choices) {
    if (decl.kind === "feat" && decl.recommended) values[decl.field] = [approach?.style ?? decl.recommended]
    if (decl.kind === "weapons") values[decl.field] = masteries(cls, decl.count, decl.rule, [classKit, backgroundKit])
    if (decl.kind === "expertise" && RECOMMENDED_EXPERTISE.every((id) => taken.has(id))) values[decl.field] = RECOMMENDED_EXPERTISE
  }

  // Languages the species is tied to, unless the player picked their own.
  if (chosen.languages.length === 0) values.languages = SPECIES_LANGUAGES[species.id] ?? []

  // Only what was filled in is marked; an empty pick is left to finish.
  const suggested = Object.keys(values).filter((field) => field !== "level" && !(Array.isArray(values[field]) && (values[field] as unknown[]).length === 0))
  const marked = suggested.map((field) => (ABILITIES.some(([id]) => id === field) || field === "ability-increase" ? "abilities" : field))
  return { values, suggested: [...new Set(marked)], classKit, backgroundKit, modifiers: { str: modifier(total("str")), dex: modifier(total("dex")) } }
}
