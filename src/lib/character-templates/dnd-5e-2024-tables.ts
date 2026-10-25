import type { ChoiceOption } from "./types"
import { ABILITIES, BACKGROUNDS, CLASSES, ORIGIN_FEATS, SIZES, SPECIES } from "./srd-5-2-1"
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

// A table over the classes (or species, or backgrounds): the number for each.
const byId = <T extends { id: string }>(items: T[], value: (item: T) => number | undefined) =>
  Object.fromEntries(items.flatMap((item) => (value(item) === undefined ? [] : [[item.id, value(item)!]])))

// The number of an option in a list, counting from 1: how a derived choice names its pick.
const numberIn = (options: ChoiceOption[], id: string) => options.findIndex((option) => option.id === id) + 1

export const HIT_DIE = byId(CLASSES, (c) => c.hitDie)
export const SKILL_CHOICES = byId(CLASSES, (c) => c.skillCount)
export const SPELL_ABILITY = byId(CLASSES, (c) => c.spellAbility ? numberIn(ABILITY_OPTIONS, c.spellAbility) : undefined)
export const SAVE_PROFICIENCY = (ability: AbilityId) => byId(CLASSES, (c) => (c.saves.includes(ability) ? 1 : undefined))
// A class with no list of skills offers any.
export const CLASS_SKILL_OPTION = (skill: string) =>
  byId(CLASSES, (c) => (!c.skills || c.skills.includes(skill) ? 1 : undefined))
export const BACKGROUND_SKILL = (skill: string) => byId(BACKGROUNDS, (b) => (b.skills.includes(skill) ? 1 : undefined))
export const BACKGROUND_FEAT = byId(BACKGROUNDS, (b) => numberIn(FEAT_OPTIONS, b.feat))
export const SPECIES_SPEED = byId(SPECIES, (s) => s.speed)
export const SPECIES_DARKVISION = byId(SPECIES, (s) => s.darkvision)
export const SPECIES_SIZE = byId(SPECIES, (s) => numberIn(SIZE_OPTIONS, s.size))
export const CARRY_PER_STRENGTH = Object.fromEntries(SIZES.map((size) => [size.id, size.carryPerStrength]))

// A background lets one of its abilities go up by 2 and another by 1, or all three by 1
// (p. 83). Each way is an option, named by what it adds to each ability.
type Increase = { id: string; label: string; adds: Partial<Record<AbilityId, number>> }

const name = (ability: AbilityId) => ABILITIES.find(([id]) => id === ability)![1]

function increasesFor(abilities: AbilityId[]): Increase[] {
  const split = abilities.flatMap((two) =>
    abilities
      .filter((one) => one !== two)
      .map((one) => ({ id: `${two}+2,${one}+1`, label: `+2 ${name(two)}, +1 ${name(one)}`, adds: { [two]: 2, [one]: 1 } }))
  )
  const spread = {
    id: abilities.map((ability) => `${ability}+1`).join(","),
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


