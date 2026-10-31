import type { AbilityId } from "./srd-5-2-1"

// Our own suggestions for the quick build, not SRD text. Each is a short order of
// preference: the build takes the first ones the character does not already have.

// Skills a class suggests, best first, from the class's own list (a Bard may take any).
export const SUGGESTED_SKILLS: Record<string, string[]> = {
  barbarian: ["athletics", "perception", "survival", "intimidation"],
  bard: ["persuasion", "performance", "insight", "deception", "perception"],
  cleric: ["insight", "medicine", "persuasion", "religion", "history"],
  druid: ["perception", "nature", "survival", "medicine", "insight"],
  fighter: ["athletics", "perception", "acrobatics", "intimidation", "survival"],
  monk: ["acrobatics", "stealth", "athletics", "insight", "history"],
  paladin: ["athletics", "persuasion", "insight", "intimidation", "medicine"],
  ranger: ["perception", "stealth", "survival", "nature", "athletics", "insight"],
  rogue: ["stealth", "sleight-of-hand", "perception", "deception", "investigation", "insight", "acrobatics"],
  sorcerer: ["persuasion", "arcana", "insight", "deception", "intimidation"],
  warlock: ["arcana", "investigation", "deception", "intimidation", "history"],
  wizard: ["arcana", "investigation", "history", "insight", "medicine"],
}

// p. 61 (Rogue, Expertise): Sleight of Hand and Stealth are recommended.
export const RECOMMENDED_EXPERTISE = ["sleight-of-hand", "stealth"]

export type AbilityMethod = "standard" | "point-buy" | "own"

export const ABILITY_METHODS: { id: AbilityMethod; label: string; note: string }[] = [
  { id: "standard", label: "Standard array", note: "The SRD’s suggested scores for your class." },
  { id: "point-buy", label: "Point buy", note: "The same scores, ready to adjust with 27 points." },
  { id: "own", label: "Custom", note: "Any score you like: rolled, or agreed with your GM." },
]

// How a class fights, for the classes whose primary ability is a choice (p. 47: a Fighter's is
// Strength or Dexterity). The others’ primary abilities are all required and they have one
// kit, so they have no choice to offer. The first is the default. Kit and style are ids in
// srd-5-2-1-kits.ts and srd-5-2-1-feats.ts.
export type Approach = { id: string; label: string; line: string; ability: AbilityId; kit: string; style: string }

export const APPROACHES: Record<string, Approach[]> = {
  fighter: [
    { id: "strength", label: "Up close", line: "Strength, heavy armor, big weapons", ability: "str", kit: "fighter-a", style: "Defense" },
    { id: "dexterity", label: "Agile", line: "Dexterity, light armor, bows and finesse", ability: "dex", kit: "fighter-b", style: "Archery" },
  ],
}

// p. 20 (Standard Languages): the language each species is tied to, where the table names one.
export const SPECIES_LANGUAGES: Record<string, string[]> = {
  dragonborn: ["Draconic"],
  dwarf: ["Dwarvish"],
  elf: ["Elvish"],
  gnome: ["Gnomish"],
  goliath: ["Giant"],
  halfling: ["Halfling"],
  orc: ["Orc"],
}
