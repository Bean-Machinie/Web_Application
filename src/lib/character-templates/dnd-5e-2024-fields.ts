import { add, field, floor, lookup, max, min, multiply, number, option, pick, picked, when } from "./formulas"
import * as table from "./dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP, HUMAN, MAGIC_INITIATE_ABILITIES, MAGIC_INITIATE_FEATS, SKILLS } from "./srd-5-2-1"
import type { AbilityId } from "./srd-5-2-1"
import type { Condition, TemplateField } from "./types"

// The inputs the rest of the sheet is worked out from, in the profile column.
const identity = { tab: "overview", section: "identity" } as const
export const identityFields: TemplateField[] = [
  { ...identity, id: "character-class", type: "choice", label: "Class", choices: { options: table.CLASS_OPTIONS } },
  { ...identity, id: "level", type: "stat", label: "Level", range: [1, 20] },
  { ...identity, id: "species-choice", type: "choice", label: "Species", choices: { options: table.SPECIES_OPTIONS } },
  { ...identity, id: "background-choice", type: "choice", label: "Background", choices: { options: table.BACKGROUND_OPTIONS } },
  { ...identity, id: "alignment", type: "line", label: "Alignment" },
]

const scores = { tab: "overview", section: "abilities" } as const

// The score as typed, the total after the background's increase (never above 20), and the
// modifier of the total.
export const abilityFields = ABILITIES.flatMap(([id, label]): TemplateField[] => [
  { ...scores, id, type: "stat", label, secondary: `${id}.total`, tertiary: `${id}.mod` },
  {
    ...scores,
    id: `${id}.total`,
    type: "stat",
    label: `${label} total`,
    derived: max(field(id), min(number(ABILITY_CAP), add(field(id), lookup("ability-increase", table.INCREASE_TO(id), 0)))),
  },
  { ...scores, id: `${id}.mod`, type: "stat", label: "Modifier", format: "signed", derived: floor(field(`${id}.total`), -10, 2) },
])

const background = { tab: "overview", section: "background" } as const

export const backgroundFields: TemplateField[] = [
  {
    ...background, id: "origin-feat", type: "choice", label: "Origin feat", title: "origin feat", locked: true,
    overrideLabel: "Change feat (house rule)", source: "background-choice", choices: { options: table.FEAT_OPTIONS },
    derived: option("origin-feat", "background-choice", table.BACKGROUND_FEAT),
  },
  abilityChoice("origin-feat.ability", "origin-feat", background.section, [{ field: "origin-feat", is: MAGIC_INITIATE_FEATS }]),
  {
    ...background, id: "tool-proficiency", type: "choice", label: "Tool", title: "tool proficiency", locked: true,
    source: "background-choice", choices: { options: table.TOOL_OPTIONS },
    derived: option("tool-proficiency", "background-choice", table.BACKGROUND_TOOL),
  },
  {
    ...background, id: "ability-increase", type: "choice", label: "Ability increase", control: "ability-increase",
    choices: { by: "background-choice", options: table.INCREASE_OPTIONS },
  },
]

// A Magic Initiate feat asks for its spellcasting ability (p. 87).
function abilityChoice(id: string, feat: string, section: string, showIf: Condition[]): TemplateField {
  return {
    tab: "overview", section, id, type: "choice", label: "Spellcasting", title: `${feat} spellcasting ability`,
    hint: "feat", showIf,
    choices: { options: table.ABILITY_OPTIONS.filter((option) => MAGIC_INITIATE_ABILITIES.includes(option.id as AbilityId)) },
  }
}

const human = { tab: "overview", section: "species-choices" } as const
const isHuman: Condition = { field: "species-choice", is: HUMAN }

// Human (p. 86): Versatile gives an Origin feat of their choice, and Skillful a skill.
export const humanFields: TemplateField[] = [
  { ...human, id: "versatile-feat", type: "choice", label: "Versatile", title: "Versatile: an Origin feat", showIf: [isHuman], choices: { options: table.VERSATILE_OPTIONS } },
  abilityChoice("versatile-feat.ability", "versatile-feat", human.section, [isHuman, { field: "versatile-feat", is: MAGIC_INITIATE_FEATS }]),
  { ...human, id: "human-skill", type: "choice", label: "Skillful", title: "Skillful: proficiency in one skill", showIf: [isHuman], choices: { options: table.SKILL_OPTIONS } },
]

const combat = { tab: "overview", section: "combat" } as const
const body = { tab: "overview", section: "body" } as const
const hp = { tab: "overview", section: "hit-points" } as const

export const combatFields: TemplateField[] = [
  { ...combat, id: "ac", type: "stat", label: "Armor Class" },
  { ...combat, id: "initiative", type: "stat", label: "Initiative", format: "signed", derived: field("dex.mod") },
  { ...combat, id: "speed", type: "stat", label: "Speed", format: "feet", derived: lookup("species-choice", table.SPECIES_SPEED) },
  { ...combat, id: "proficiency-bonus", type: "stat", label: "Proficiency", title: "Proficiency Bonus", format: "signed", derived: add(floor(field("level"), -1, 4), number(2)) },
  { ...combat, id: "passive-perception", type: "stat", label: "Passive", title: "Passive Perception", derived: add(number(10), field("skill.perception")) },
  { ...combat, id: "inspiration", type: "toggle", label: "Inspiration" },
  { ...body, id: "size", type: "choice", label: "Size", choices: { options: table.SIZE_OPTIONS }, derived: option("size", "species-choice", table.SPECIES_SIZE) },
  { ...body, id: "darkvision", type: "stat", label: "Darkvision", format: "feet", derived: lookup("species-choice", table.SPECIES_DARKVISION) },
  { ...body, id: "carrying-capacity", type: "stat", label: "Carrying", title: "Carrying capacity", format: "pounds", derived: multiply(field("str.total"), lookup("size", table.CARRY_PER_STRENGTH)) },
]

// At level 1 the hit die's highest roll; after that its average, rounded up, per level. Each
// level adds at least 1 (p. 23).
const perLevel = max(number(1), add(floor(field("hit-die"), 0, 2), number(1), field("con.mod")))

// Dwarven Toughness: 1 for each level, from level 1.
const toughness = multiply(field("level"), lookup("species-choice", table.SPECIES_HP_PER_LEVEL, 0))

export const hitPointFields: TemplateField[] = [
  { ...hp, id: "hp", type: "resource", label: "Hit Points", pinned: true, maxFrom: "hp.max" },
  {
    ...hp, id: "hp.max", type: "stat", label: "Hit Points maximum",
    derived: add(field("hit-die"), field("con.mod"), multiply(add(field("level"), number(-1)), perLevel), toughness),
  },
  { ...hp, id: "hit-dice", type: "resource", label: "Hit Dice", maxFrom: "hit-dice.max" },
  { ...hp, id: "hit-dice.max", type: "stat", label: "Hit Dice maximum", hidden: true, derived: field("level") },
  { ...hp, id: "hit-die", type: "stat", label: "Hit Die", format: "die", derived: lookup("character-class", table.HIT_DIE) },
  // The two tracks share one row.
  { ...hp, id: "death-saves.successes", type: "track", label: "Death Saves", caption: "Successes", config: { length: 3 }, secondary: "death-saves.failures" },
  { ...hp, id: "death-saves.failures", type: "track", label: "Failures", caption: "Failures", config: { length: 3 } },
]

const modifiers = Object.fromEntries(ABILITIES.map(([id]) => [id, `${id}.mod`]))
const caster = { tab: "spells", section: "spellcasting" } as const

export const spellFields: TemplateField[] = [
  { ...caster, id: "spell-ability", type: "choice", label: "Ability", title: "Spellcasting ability", choices: { options: table.ABILITY_OPTIONS }, derived: option("spell-ability", "character-class", table.SPELL_ABILITY) },
  { ...caster, id: "spell-dc", type: "stat", label: "Save DC", title: "Spell save DC", showWhen: "spell-ability", derived: add(number(8), pick("spell-ability", modifiers), field("proficiency-bonus")) },
  { ...caster, id: "spell-attack", type: "stat", label: "Attack", title: "Spell attack bonus", format: "signed", showWhen: "spell-ability", derived: add(pick("spell-ability", modifiers), field("proficiency-bonus")) },
]

// A proficiency toggle with its total beside it: the ability modifier, plus the
// proficiency bonus if proficient. The toggle is on when the class (saves) or background
// (skills) gives it, unless the player says otherwise.
function proficiencyRow(tab: string, section: string, id: string, label: string, ability: AbilityId, given: TemplateField["derived"], options: Partial<TemplateField> = {}): TemplateField[] {
  return [
    { id: `${id}.prof`, tab, section, type: "toggle", label, hint: ability.toUpperCase(), secondary: id, derived: given, ...options },
    { id, tab, section, type: "stat", label, format: "signed", derived: add(field(`${ability}.mod`), when(`${id}.prof`, field("proficiency-bonus"), number(0))) },
  ]
}

// On when the background gives the skill, the class lets you pick it and you did, or a
// Human chose it with Skillful.
const givenSkill = (skill: string) =>
  max(
    lookup("background-choice", table.BACKGROUND_SKILL(skill), 0),
    multiply(picked("class-skills", skill), lookup("character-class", table.CLASS_SKILL_OPTION(skill), 0)),
    multiply(lookup("species-choice", table.IS_HUMAN, 0), lookup("human-skill", table.HUMAN_SKILL(skill), 0))
  )

export const proficiencyFields: TemplateField[] = [
  ...ABILITIES.flatMap(([ability, label]) =>
    proficiencyRow("overview", "saving-throws", `save.${ability}`, label, ability, lookup("character-class", table.SAVE_PROFICIENCY(ability)))
  ),
  ...SKILLS.flatMap(([id, label, ability]) =>
    proficiencyRow("skills", "skills", `skill.${id}`, label, ability, givenSkill(id), {
      note: { text: "from Human", when: [isHuman, { field: "human-skill", is: id }] },
    })
  ),
  // The skills picked from the class's list, set in the builder.
  { id: "class-skills", tab: "skills", section: "skills", type: "picks", label: "Class skills", hidden: true },
]
