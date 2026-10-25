import { add, field, floor, lookup, max, min, multiply, number, pick, when } from "./formulas"
import * as table from "./dnd-5e-2024-tables"
import { ABILITIES, ABILITY_CAP, SKILLS } from "./srd-5-2-1"
import type { AbilityId } from "./srd-5-2-1"
import type { TemplateField } from "./types"

// The inputs the rest of the sheet is worked out from, in the profile column.
const identity = { tab: "overview", section: "identity" } as const
const previous = (id: string, hint: string): TemplateField => ({
  ...identity, id, type: "line", label: "Previous text", hint, showWhen: id,
})

export const identityFields: TemplateField[] = [
  { ...identity, id: "character-class", type: "choice", label: "Class", choices: { options: table.CLASS_OPTIONS } },
  { ...identity, id: "level", type: "stat", label: "Level", range: [1, 20] },
  { ...identity, id: "species-choice", type: "choice", label: "Species", choices: { options: table.SPECIES_OPTIONS } },
  { ...identity, id: "background-choice", type: "choice", label: "Background", choices: { options: table.BACKGROUND_OPTIONS } },
  { ...identity, id: "alignment", type: "line", label: "Alignment" },
  // The v1 text fields keep their ids and what they held.
  previous("class", "Class and level"),
  previous("species", "Species"),
  previous("background", "Background"),
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
  { ...background, id: "origin-feat", type: "choice", label: "Origin feat", choices: { options: table.FEAT_OPTIONS }, derived: lookup("background-choice", table.BACKGROUND_FEAT) },
  {
    ...background, id: "ability-increase", type: "choice", label: "Ability increase",
    choices: { by: "background-choice", options: table.INCREASE_OPTIONS },
  },
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
  { ...body, id: "size", type: "choice", label: "Size", choices: { options: table.SIZE_OPTIONS }, derived: lookup("species-choice", table.SPECIES_SIZE) },
  { ...body, id: "darkvision", type: "stat", label: "Darkvision", format: "feet", derived: lookup("species-choice", table.SPECIES_DARKVISION) },
  { ...body, id: "carrying-capacity", type: "stat", label: "Carrying", title: "Carrying capacity", format: "pounds", derived: multiply(field("str.total"), lookup("size", table.CARRY_PER_STRENGTH)) },
]

// At level 1 the hit die's highest roll; after that its average, rounded up, per level. Each
// level adds at least 1 (p. 23).
const perLevel = max(number(1), add(floor(field("hit-die"), 0, 2), number(1), field("con.mod")))

export const hitPointFields: TemplateField[] = [
  { ...hp, id: "hp", type: "resource", label: "Hit Points", pinned: true, maxFrom: "hp.max" },
  {
    ...hp, id: "hp.max", type: "stat", label: "Hit Points maximum",
    derived: add(field("hit-die"), field("con.mod"), multiply(add(field("level"), number(-1)), perLevel)),
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
  { ...caster, id: "spell-ability", type: "choice", label: "Ability", title: "Spellcasting ability", choices: { options: table.ABILITY_OPTIONS }, derived: lookup("character-class", table.SPELL_ABILITY) },
  { ...caster, id: "spell-dc", type: "stat", label: "Save DC", title: "Spell save DC", showWhen: "spell-ability", derived: add(number(8), pick("spell-ability", modifiers), field("proficiency-bonus")) },
  { ...caster, id: "spell-attack", type: "stat", label: "Attack", title: "Spell attack bonus", format: "signed", showWhen: "spell-ability", derived: add(pick("spell-ability", modifiers), field("proficiency-bonus")) },
]

// A proficiency toggle with its total beside it: the ability modifier, plus the
// proficiency bonus if proficient. The toggle is on when the class (saves) or background
// (skills) gives it, unless the player says otherwise.
function proficiencyRow(section: string, id: string, label: string, ability: AbilityId, given: TemplateField["derived"], options: Partial<TemplateField> = {}): TemplateField[] {
  return [
    { id: `${id}.prof`, tab: "skills", section, type: "toggle", label, hint: ability.toUpperCase(), secondary: id, derived: given, ...options },
    { id, tab: "skills", section, type: "stat", label, format: "signed", derived: add(field(`${ability}.mod`), when(`${id}.prof`, field("proficiency-bonus"), number(0))) },
  ]
}

export const proficiencyFields: TemplateField[] = [
  ...ABILITIES.flatMap(([ability, label]) =>
    proficiencyRow("saving-throws", `save.${ability}`, label, ability, lookup("character-class", table.SAVE_PROFICIENCY(ability)))
  ),
  ...SKILLS.flatMap(([id, label, ability]): TemplateField[] => [
    ...proficiencyRow("skills", `skill.${id}`, label, ability, lookup("background-choice", table.BACKGROUND_SKILL(id)), {
      highlight: `skill.${id}.option`,
    }),
    { id: `skill.${id}.option`, tab: "skills", section: "skills", type: "toggle", label, hidden: true, derived: lookup("character-class", table.CLASS_SKILL_OPTION(id)) },
  ]),
  // How many skills the class lets you choose, for the line over the skills.
  { id: "skills.choose", tab: "skills", section: "skills", type: "stat", label: "Skills to choose", hidden: true, derived: lookup("character-class", table.SKILL_CHOICES) },
]
