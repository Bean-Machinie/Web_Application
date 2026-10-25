import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"

// Scores the helper hands back, for the abilities it has one for.
export type Scores = Partial<Record<AbilityId, number>>

// One die of the given sides, from the browser's secure random numbers.
export function rollDie(sides: number) {
  const [random] = crypto.getRandomValues(new Uint32Array(1))
  return 1 + Math.floor((random / 2 ** 32) * sides)
}

// One score by the Random Generation method: the dice rolled, and the lowest set aside.
export type Roll = { dice: number[]; dropped: number; total: number }

export function rollScore(diceCount: number): Roll {
  const dice = Array.from({ length: diceCount }, () => rollDie(6))
  const dropped = dice.indexOf(Math.min(...dice))
  return { dice, dropped, total: dice.reduce((sum, die, index) => (index === dropped ? sum : sum + die), 0) }
}
