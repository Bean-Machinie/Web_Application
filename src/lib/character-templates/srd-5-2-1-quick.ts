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
  { id: "own", label: "My own scores", note: "Rolled or agreed with your GM. Entered later." },
]
