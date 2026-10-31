import { abilityName } from "../character-format"
import type { ChoiceOption } from "./types"
import { ARMOR, MEDIUM_ARMOR_DEX_CAP, SHIELD_AC } from "./srd-5-2-1-gear"
import { BACKGROUND_KITS, CLASS_KITS } from "./srd-5-2-1-kits"
import { DROW, WOOD_ELF } from "./srd-5-2-1-origins"
import { ABILITIES, BACKGROUNDS, CLASSES, ORIGIN_FEATS, SIZES, SPECIES, TOOLS } from "./srd-5-2-1"
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
export const TOOL_OPTIONS = TOOLS.map((tool) => ({ id: tool, label: tool }))

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
// Human and Tiefling choose their size, so there is none until they do.
export const SPECIES_SIZE = idsOf(SPECIES, (s) => (s.sizeChoice ? undefined : s.size))
export const CARRY_PER_STRENGTH = Object.fromEntries(SIZES.map((size) => [size.id, size.carryPerStrength]))

// A background lets one of its abilities go up by 2 and another by 1, or all three by 1
// (p. 83). Each way is an option, named by what it adds to each ability.
type Increase = { id: string; label: string; adds: Partial<Record<AbilityId, number>> }


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
      .map((one) => ({ id: splitIncreaseId(two, one), label: `+2 ${abilityName(two)}, +1 ${abilityName(one)}`, adds: { [two]: 2, [one]: 1 } }))
  )
  const spread = {
    id: spreadIncreaseId(abilities),
    label: `+1 ${abilities.map(abilityName).join(", ")}`,
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




// Armor Class. The kit chosen names the armor worn and whether there is a Shield; the
// armor then sets the base, how much Dexterity counts, and whether it is armor at all.
const kits = [...Object.values(CLASS_KITS), ...Object.values(BACKGROUND_KITS)].flat()
export const KIT_ARMOR = Object.fromEntries(kits.flatMap((kit) => kit.items.filter((item) => item.armor).map((item) => [kit.id, item.armor!])))
export const KIT_SHIELD = Object.fromEntries(kits.filter((kit) => kit.items.some((item) => item.shield)).map((kit) => [kit.id, SHIELD_AC]))
export const ARMOR_OPTIONS = ARMOR.map(({ id, label }) => ({ id, label }))
export const ARMOR_BASE = Object.fromEntries(ARMOR.map((armor) => [armor.id, armor.base]))
// Heavy armor ignores Dexterity.
export const ARMOR_USES_DEX = Object.fromEntries(ARMOR.map((armor) => [armor.id, armor.kind === "heavy" ? 0 : 1]))
export const ARMOR_DEX_CAP = Object.fromEntries(ARMOR.filter((armor) => armor.kind === "medium").map((armor) => [armor.id, MEDIUM_ARMOR_DEX_CAP]))
export const ARMOR_WORN = Object.fromEntries(ARMOR.map((armor) => [armor.id, 1]))
export const NO_ARMOR_ONLY = Object.fromEntries(ARMOR.map((armor) => [armor.id, 0]))

// The equipment options of each class and background, as the options of a choice by it.
const kitOptions = (all: typeof CLASS_KITS) =>
  Object.fromEntries(Object.entries(all).map(([owner, list]) => [owner, list.map((kit) => ({ id: kit.id, label: kit.label === "Gold" ? "Gold" : `Kit ${kit.label}` }))]))
export const CLASS_KIT_OPTIONS = kitOptions(CLASS_KITS)
export const BACKGROUND_KIT_OPTIONS = kitOptions(BACKGROUND_KITS)

// The Unarmored Defense of the Barbarian and the Monk adds one more modifier.
export const UNARMORED_DEFENSE = { barbarian: "con.mod", monk: "wis.mod" }

export const ELF_LINEAGE_SPEED = { [WOOD_ELF]: 35 }
export const ELF_LINEAGE_DARKVISION = { [DROW]: 120 }
