import type { ChoiceOption } from "./types"
import { ABILITIES, BACKGROUNDS, CLASSES, HUMAN, ORIGIN_FEATS, RECOMMENDED_FEAT, SIZES, SKILLS, SPECIES, TOOLS } from "./srd-5-2-1"
import type { AbilityId } from "./srd-5-2-1"

// The SRD's data as the choices and tables the template's formulas read.

const labelled = (items: { id: string; label: string }[]): ChoiceOption[] =>
  items.map(({ id, label }) => ({ id, label }))

export const CLASS_OPTIONS = labelled(CLASSES)
export const SPECIES_OPTIONS = labelled(SPECIES)
export const BACKGROUND_OPTIONS = labelled(BACKGROUNDS)
export const ABILITY_OPTIONS = labelled(ABILITIES.map(([id, label]) => ({ id, label })))
export const SIZE_OPTIONS = labelled(SIZES)
export const FEAT_OPTIONS = ORIGIN_FEATS.map((feat) => ({ id: feat, label: feat }))
// What a Human chooses with Versatile: any of them, the SRD recommending one.
export const VERSATILE_OPTIONS = FEAT_OPTIONS.map((feat) => ({
  ...feat,
  label: feat.id === RECOMMENDED_FEAT ? `${feat.label} · Recommended` : feat.label,
}))
export const TOOL_OPTIONS = TOOLS.map((tool) => ({ id: tool, label: tool }))
export const SKILL_OPTIONS = SKILLS.map(([id, label]) => ({ id, label }))

// A table over the classes (or species, or backgrounds): the number for each.
const byId = <T extends { id: string }>(items: T[], value: (item: T) => number | undefined) =>
  Object.fromEntries(items.flatMap((item) => (value(item) === undefined ? [] : [[item.id, value(item)!]])))

// The same for a derived choice, naming the option by its id.
const idsOf = <T extends { id: string }>(items: T[], value: (item: T) => string | undefined) =>
  Object.fromEntries(items.flatMap((item) => (value(item) === undefined ? [] : [[item.id, value(item)!]])))

export const HIT_DIE = byId(CLASSES, (c) => c.hitDie)
export const SKILL_CHOICES = byId(CLASSES, (c) => c.skillCount)
export const SPELL_ABILITY = idsOf(CLASSES, (c) => c.spellAbility ?? undefined)
export const SAVE_PROFICIENCY = (ability: AbilityId) => byId(CLASSES, (c) => (c.saves.includes(ability) ? 1 : undefined))
// A class with no list of skills offers any.
export const CLASS_SKILL_OPTION = (skill: string) =>
  byId(CLASSES, (c) => (!c.skills || c.skills.includes(skill) ? 1 : undefined))
export const BACKGROUND_SKILL = (skill: string) => byId(BACKGROUNDS, (b) => (b.skills.includes(skill) ? 1 : undefined))
export const BACKGROUND_TOOL = idsOf(BACKGROUNDS, (b) => b.tool)
export const BACKGROUND_FEAT = idsOf(BACKGROUNDS, (b) => b.feat)
export const SPECIES_HP_PER_LEVEL = byId(SPECIES, (s) => s.hpPerLevel)
export const SPECIES_SPEED = byId(SPECIES, (s) => s.speed)
export const SPECIES_DARKVISION = byId(SPECIES, (s) => s.darkvision)
export const SPECIES_SIZE = idsOf(SPECIES, (s) => s.size)
export const CARRY_PER_STRENGTH = Object.fromEntries(SIZES.map((size) => [size.id, size.carryPerStrength]))

// A background lets one of its abilities go up by 2 and another by 1, or all three by 1
// (p. 83). Each way is an option, named by what it adds to each ability.
type Increase = { id: string; label: string; adds: Partial<Record<AbilityId, number>> }

const name = (ability: AbilityId) => ABILITIES.find(([id]) => id === ability)![1]

// The id of each way: what it adds to each ability, so it never depends on list order.
export const splitIncreaseId = (two: AbilityId, one: AbilityId) => `${two}+2,${one}+1`
export const spreadIncreaseId = (abilities: AbilityId[]) => abilities.map((ability) => `${ability}+1`).join(",")

// Reads an id back: the split names the ability that gets 2 and the one that gets 1.
export function parseIncrease(id: string | null) {
  if (!id) return null
  const [first, second, third] = id.split(",").map((part) => part.split("+")[0] as AbilityId)
  return third ? { mode: "spread" as const } : { mode: "split" as const, two: first, one: second }
}

function increasesFor(abilities: AbilityId[]): Increase[] {
  const split = abilities.flatMap((two) =>
    abilities
      .filter((one) => one !== two)
      .map((one) => ({ id: splitIncreaseId(two, one), label: `+2 ${name(two)}, +1 ${name(one)}`, adds: { [two]: 2, [one]: 1 } }))
  )
  const spread = {
    id: spreadIncreaseId(abilities),
    label: `+1 ${abilities.map(name).join(", ")}`,
    adds: Object.fromEntries(abilities.map((ability) => [ability, 1])),
  }
  return [...split, spread]
}

const increases = Object.fromEntries(BACKGROUNDS.map((background) => [background.id, increasesFor(background.abilities)]))

export const INCREASE_OPTIONS: Record<string, ChoiceOption[]> = Object.fromEntries(
  Object.entries(increases).map(([background, list]) => [background, list.map(({ id, label }) => ({ id, label }))])
)

// What an increase adds to one ability, by option; the options of every background together.
export const INCREASE_TO = (ability: AbilityId): Record<string, number> =>
  Object.fromEntries(
    Object.values(increases)
      .flat()
      .flatMap((increase) => (increase.adds[ability] ? [[increase.id, increase.adds[ability]!]] : []))
  )



// Skillful: the skill a Human chose counts only while the species is Human.
export const IS_HUMAN = { [HUMAN]: 1 }
export const HUMAN_SKILL = (skill: string) => ({ [skill]: 1 })
