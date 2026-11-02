export const DICE = [4, 6, 8, 10, 12, 20, 100] as const
export type Sides = (typeof DICE)[number]
export type D20Mode = "normal" | "advantage" | "disadvantage"

export type Roll = {
  id: number
  sides: Sides
  modifier: number
  // Every die thrown; on advantage or disadvantage the kept one is at `kept`.
  dice: number[]
  kept: number
  total: number
}

// Uniform in 1..sides: values that would favour the low numbers are thrown away.
function randomInt(sides: number) {
  const limit = 0x100000000 - (0x100000000 % sides)
  const buffer = new Uint32Array(1)
  do crypto.getRandomValues(buffer)
  while (buffer[0] >= limit)
  return (buffer[0] % sides) + 1
}

let nextId = 0

export function rollDice(sides: Sides, modifier: number, mode: D20Mode): Roll {
  const count = sides === 20 && mode !== "normal" ? 2 : 1
  const dice = Array.from({ length: count }, () => randomInt(sides))
  const pick = mode === "disadvantage" ? Math.min : Math.max
  const kept = dice.indexOf(pick(...dice))
  return { id: nextId++, sides, modifier, dice, kept, total: dice[kept] + modifier }
}

export function notation({ sides, modifier, dice }: Roll) {
  const base = `${dice.length}d${sides}`
  if (modifier === 0) return base
  return `${base} ${modifier > 0 ? "+" : "−"} ${Math.abs(modifier)}`
}

// What the 3D dice are told to land on, in dice-box-threejs's notation.
export const throwNotation = ({ sides, dice }: Roll) => `${dice.length}d${sides}@${dice.join(",")}`
