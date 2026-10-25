// Rules data taken from the System Reference Document 5.2.1, with the page it is on. Only
// numbers and names, no rules text. The licence notice is in legal-notices.ts.

export type AbilityId = "str" | "dex" | "con" | "int" | "wis" | "cha"

// p. 5, 9 (The Six Abilities, Skills).
export const ABILITIES: [AbilityId, string][] = [
  ["str", "Strength"],
  ["dex", "Dexterity"],
  ["con", "Constitution"],
  ["int", "Intelligence"],
  ["wis", "Wisdom"],
  ["cha", "Charisma"],
]

// p. 9 (Skills table).
export const SKILLS: [string, string, AbilityId][] = [
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

// p. 21 (Generate Your Scores): the Standard Array, and Point Cost with 27 points to spend.
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
export const POINT_BUY_BUDGET = 27
// p. 21 (Ability Score Point Costs): a score from 8 to 15 and what it costs.
export const POINT_BUY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
export const POINT_BUY_MIN = 8
export const POINT_BUY_MAX = 15
// p. 21 (Random Generation): four d6, the highest three added up; six times.
export const ROLL_DICE = 4

// p. 21 (Adjust Ability Scores): a background's increases cannot raise a score above 20.
export const ABILITY_CAP = 20

// p. 23 (Character Advancement): the Proficiency Bonus by level.
export const proficiencyBonusAt = (level: number) => 2 + Math.floor((level - 1) / 4)

export type SrdClass = {
  id: string
  label: string
  // The die's sides: p. 22 (Level 1 Hit Points by Class) and each class's Core Traits.
  hitDie: number
  // Core Traits table, Saving Throw Proficiencies.
  saves: [AbilityId, AbilityId]
  // Core Traits table, Skill Proficiencies: how many to choose, from which. No list: any.
  skillCount: number
  skills?: string[]
  // The class's Spellcasting (or Pact Magic) feature; none for classes without one.
  spellAbility: AbilityId | null
  // The class's Core Traits table.
  page: number
}

export const CLASSES: SrdClass[] = [
  { id: "barbarian", label: "Barbarian", hitDie: 12, saves: ["str", "con"], skillCount: 2, skills: ["animal-handling", "athletics", "intimidation", "nature", "perception", "survival"], spellAbility: null, page: 28 },
  { id: "bard", label: "Bard", hitDie: 8, saves: ["dex", "cha"], skillCount: 3, spellAbility: "cha", page: 31 },
  { id: "cleric", label: "Cleric", hitDie: 8, saves: ["wis", "cha"], skillCount: 2, skills: ["history", "insight", "medicine", "persuasion", "religion"], spellAbility: "wis", page: 36 },
  { id: "druid", label: "Druid", hitDie: 8, saves: ["int", "wis"], skillCount: 2, skills: ["animal-handling", "arcana", "insight", "medicine", "nature", "perception", "religion", "survival"], spellAbility: "wis", page: 41 },
  { id: "fighter", label: "Fighter", hitDie: 10, saves: ["str", "con"], skillCount: 2, skills: ["acrobatics", "animal-handling", "athletics", "history", "insight", "intimidation", "persuasion", "perception", "survival"], spellAbility: null, page: 47 },
  { id: "monk", label: "Monk", hitDie: 8, saves: ["str", "dex"], skillCount: 2, skills: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"], spellAbility: null, page: 49 },
  { id: "paladin", label: "Paladin", hitDie: 10, saves: ["wis", "cha"], skillCount: 2, skills: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"], spellAbility: "cha", page: 53 },
  { id: "ranger", label: "Ranger", hitDie: 10, saves: ["str", "dex"], skillCount: 3, skills: ["animal-handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"], spellAbility: "wis", page: 57 },
  { id: "rogue", label: "Rogue", hitDie: 8, saves: ["dex", "int"], skillCount: 4, skills: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "persuasion", "sleight-of-hand", "stealth"], spellAbility: null, page: 61 },
  { id: "sorcerer", label: "Sorcerer", hitDie: 6, saves: ["con", "cha"], skillCount: 2, skills: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"], spellAbility: "cha", page: 64 },
  { id: "warlock", label: "Warlock", hitDie: 8, saves: ["wis", "cha"], skillCount: 2, skills: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"], spellAbility: "cha", page: 70 },
  { id: "wizard", label: "Wizard", hitDie: 6, saves: ["int", "wis"], skillCount: 2, skills: ["arcana", "history", "insight", "investigation", "medicine", "nature", "religion"], spellAbility: "int", page: 77 },
]

// p. 83 (Background Descriptions): the three abilities it lists, its Origin feat and its
// two skills.
export type SrdBackground = { id: string; label: string; abilities: [AbilityId, AbilityId, AbilityId]; feat: string; skills: [string, string] }

export const BACKGROUNDS: SrdBackground[] = [
  { id: "acolyte", label: "Acolyte", abilities: ["int", "wis", "cha"], feat: "Magic Initiate (Cleric)", skills: ["insight", "religion"] },
  { id: "criminal", label: "Criminal", abilities: ["dex", "con", "int"], feat: "Alert", skills: ["sleight-of-hand", "stealth"] },
  { id: "sage", label: "Sage", abilities: ["con", "int", "wis"], feat: "Magic Initiate (Wizard)", skills: ["arcana", "history"] },
  { id: "soldier", label: "Soldier", abilities: ["str", "dex", "con"], feat: "Savage Attacker", skills: ["athletics", "intimidation"] },
]

export type SizeId = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan"

// p. 178 (Carrying Capacity): the carry weight in pounds is Strength times this.
export const SIZES: { id: SizeId; label: string; carryPerStrength: number }[] = [
  { id: "tiny", label: "Tiny", carryPerStrength: 7.5 },
  { id: "small", label: "Small", carryPerStrength: 15 },
  { id: "medium", label: "Medium", carryPerStrength: 15 },
  { id: "large", label: "Large", carryPerStrength: 30 },
  { id: "huge", label: "Huge", carryPerStrength: 60 },
  { id: "gargantuan", label: "Gargantuan", carryPerStrength: 120 },
]

// pp. 84-86 (Species Descriptions): size, Speed and the range of Darkvision in feet (0:
// none). Human and Tiefling are Medium or Small, chosen with the species; Medium here.
export type SrdSpecies = { id: string; label: string; size: SizeId; speed: number; darkvision: number }

export const SPECIES: SrdSpecies[] = [
  { id: "dragonborn", label: "Dragonborn", size: "medium", speed: 30, darkvision: 60 },
  { id: "dwarf", label: "Dwarf", size: "medium", speed: 30, darkvision: 120 },
  { id: "elf", label: "Elf", size: "medium", speed: 30, darkvision: 60 },
  { id: "gnome", label: "Gnome", size: "small", speed: 30, darkvision: 60 },
  { id: "goliath", label: "Goliath", size: "medium", speed: 35, darkvision: 0 },
  { id: "halfling", label: "Halfling", size: "small", speed: 30, darkvision: 0 },
  { id: "human", label: "Human", size: "medium", speed: 30, darkvision: 0 },
  { id: "orc", label: "Orc", size: "medium", speed: 30, darkvision: 120 },
  { id: "tiefling", label: "Tiefling", size: "medium", speed: 30, darkvision: 60 },
]

// p. 87 (Origin Feats): the feats a background can give. Magic Initiate is taken once for
// each of the Cleric, Druid or Wizard spell lists.
export const ORIGIN_FEATS = [
  "Alert",
  "Magic Initiate (Cleric)",
  "Magic Initiate (Druid)",
  "Magic Initiate (Wizard)",
  "Savage Attacker",
  "Skilled",
]

// p. 89 (Coins).
export const COINS: [string, string, string][] = [
  ["cp", "Copper", "CP"],
  ["sp", "Silver", "SP"],
  ["ep", "Electrum", "EP"],
  ["gp", "Gold", "GP"],
  ["pp", "Platinum", "PP"],
]
