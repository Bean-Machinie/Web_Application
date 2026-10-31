import type { AbilityId } from "./srd-5-2-1"

// How ability scores work, summarised from the System Reference Document 5.2.1 in plain words, each
// part with the page it is on. Shown in the ability scores' rules panel.

// p. 5 (The Six Abilities): what each score measures.
export const ABILITY_MEASURES: Record<AbilityId, string> = {
  str: "Physical might",
  dex: "Agility, reflexes and balance",
  con: "Health and stamina",
  int: "Reasoning and memory",
  wis: "Perceptiveness and mental fortitude",
  cha: "Confidence, poise and charm",
}

// p. 5 (Ability Scores): what a score means.
export const SCORE_MEANINGS: [range: string, meaning: string][] = [
  ["1", "The lowest a score can normally go"],
  ["2–9", "A weak capability"],
  ["10–11", "The human average"],
  ["12–19", "A strong capability"],
  ["20", "The highest a character's score can go, unless a feature says otherwise"],
]

// p. 5–6, 21 (Ability Modifiers): the modifier for each score, which is the score less 10, halved, rounded down.
export const MODIFIER_ROWS: [range: string, modifier: number][] = [
  ["1", -5], ["2–3", -4], ["4–5", -3], ["6–7", -2], ["8–9", -1], ["10–11", 0],
  ["12–13", 1], ["14–15", 2], ["16–17", 3], ["18–19", 4], ["20", 5],
]

// p. 6 (D20 Tests): how a modifier is used.
export const D20_STEPS = [
  "Roll a d20.",
  "Add the ability's modifier, your Proficiency Bonus if it applies, and any other bonus or penalty.",
  "Compare the total with the target number: a Difficulty Class for a check or save, an Armor Class for an attack.",
]

// p. 21 (Generate Your Scores, Adjust Ability Scores): the ways to get the six numbers, and the increase.
export const GENERATION = [
  { name: "Standard array", text: "Assign 15, 14, 13, 12, 10 and 8 to the six abilities." },
  { name: "Point buy", text: "Spend 27 points on scores from 8 to 15; higher scores cost more." },
  { name: "Random", text: "Roll four d6 and total the highest three, six times, and assign the totals. Use Custom for these." },
]
export const INCREASE_RULE = "Your background lists three abilities: raise one by 2 and another by 1, or all three by 1. Nothing goes above 20."
