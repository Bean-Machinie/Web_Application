import { add, field, floor, number, when } from "./formulas"
import type { CharacterTemplate, TemplateField } from "./types"

// Structure only, in the terms of the System Reference Document 5.1: no class features,
// spells or other rules text. The licence notice is in legal-notices.ts.

type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha"

const ABILITIES: [Ability, string][] = [
  ["str", "Strength"],
  ["dex", "Dexterity"],
  ["con", "Constitution"],
  ["int", "Intelligence"],
  ["wis", "Wisdom"],
  ["cha", "Charisma"],
]

const SKILLS: [string, string, Ability][] = [
  ["acrobatics", "Acrobatics", "dex"],
  ["animal-handling", "Animal Handling", "wis"],
  ["arcana", "Arcana", "int"],
  ["athletics", "Athletics", "str"],
  ["deception", "Deception", "cha"],
  ["history", "History", "int"],
  ["insight", "Insight", "wis"],
  ["intimidation", "Intimidation", "cha"],
  ["investigation", "Investigation", "int"],
  ["medicine", "Medicine", "wis"],
  ["nature", "Nature", "int"],
  ["perception", "Perception", "wis"],
  ["performance", "Performance", "cha"],
  ["persuasion", "Persuasion", "cha"],
  ["religion", "Religion", "int"],
  ["sleight-of-hand", "Sleight of Hand", "dex"],
  ["stealth", "Stealth", "dex"],
  ["survival", "Survival", "wis"],
]

// A proficiency toggle with its total beside it: the ability modifier, plus the
// proficiency bonus if proficient.
function proficiencyRow(section: string, id: string, label: string, ability: Ability): TemplateField[] {
  return [
    { id: `${id}.prof`, tab: "skills", section, type: "toggle", label, hint: ability.toUpperCase(), secondary: id },
    {
      id,
      tab: "skills",
      section,
      type: "stat",
      label,
      format: "signed",
      derived: add(field(`${ability}.mod`), when(`${id}.prof`, field("proficiency-bonus"), number(0))),
    },
  ]
}

const abilityFields = ABILITIES.flatMap(([id, label]): TemplateField[] => [
  { id, tab: "overview", section: "abilities", type: "stat", label, secondary: `${id}.mod` },
  {
    id: `${id}.mod`,
    tab: "overview",
    section: "abilities",
    type: "stat",
    label: "Modifier",
    format: "signed",
    derived: floor(field(id), -10, 2),
  },
])

const line = (id: string, label: string): TemplateField => ({ id, tab: "overview", section: "identity", type: "line", label })

export const DND_5E: CharacterTemplate = {
  id: "dnd-5e",
  version: 1,
  tabs: [
    { id: "overview", label: "Overview", empty: "No details yet" },
    { id: "skills", label: "Skills", empty: "No skills yet" },
    { id: "inventory", label: "Inventory", empty: "No items yet" },
    { id: "spells", label: "Spells", empty: "No spells yet" },
    { id: "notes", label: "Notes", empty: "No notes yet" },
  ],
  // Identity is in the profile column; the scores are tiles three across, the combat
  // numbers small tiles, and the skills compact rows in two columns.
  sections: [
    { id: "identity", tab: "overview", label: "Identity", profile: true },
    { id: "abilities", tab: "overview", label: "Ability scores", layout: "grid", columns: 6, summary: "6 scores" },
    { id: "combat", tab: "overview", label: "Combat", layout: "grid", columns: 5, summary: "Armor Class, Initiative, Speed" },
    { id: "hit-points", tab: "overview", label: "Hit points", summary: "Hit Points, Hit Dice, Death Saves" },
    { id: "saving-throws", tab: "skills", label: "Saving throws", columns: 2, summary: "6 saves" },
    { id: "skills", tab: "skills", label: "Skills", columns: 2, summary: "18 skills" },
  ],
  fields: [
    line("class", "Class and level"),
    line("species", "Species"),
    line("background", "Background"),
    line("alignment", "Alignment"),
    ...abilityFields,
    { id: "ac", tab: "overview", section: "combat", type: "stat", label: "Armor Class" },
    { id: "initiative", tab: "overview", section: "combat", type: "stat", label: "Initiative", format: "signed", derived: field("dex.mod") },
    { id: "speed", tab: "overview", section: "combat", type: "stat", label: "Speed" },
    { id: "proficiency-bonus", tab: "overview", section: "combat", type: "stat", label: "Proficiency", title: "Proficiency Bonus", format: "signed" },
    { id: "inspiration", tab: "overview", section: "combat", type: "toggle", label: "Inspiration" },
    { id: "hp", tab: "overview", section: "hit-points", type: "resource", label: "Hit Points", pinned: true },
    { id: "hit-dice", tab: "overview", section: "hit-points", type: "resource", label: "Hit Dice" },
    // The two tracks share one row.
    { id: "death-saves.successes", tab: "overview", section: "hit-points", type: "track", label: "Death Saves", caption: "Successes", config: { length: 3 }, secondary: "death-saves.failures" },
    { id: "death-saves.failures", tab: "overview", section: "hit-points", type: "track", label: "Failures", caption: "Failures", config: { length: 3 } },
    ...ABILITIES.flatMap(([ability, label]) => proficiencyRow("saving-throws", `save.${ability}`, label, ability)),
    ...SKILLS.flatMap(([id, label, ability]) => proficiencyRow("skills", `skill.${id}`, label, ability)),
    { id: "inventory", tab: "inventory", type: "list", label: "Inventory" },
    { id: "spells", tab: "spells", type: "list", label: "Spells" },
  ],
}
