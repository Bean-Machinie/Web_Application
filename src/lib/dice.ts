export const DICE = [4, 6, 8, 10, 12, 20, 100] as const
export type Sides = (typeof DICE)[number]
export type D20Mode = "normal" | "advantage" | "disadvantage"

export type Roll = {
  id: number
  sides: Sides
  modifier: number
  // Only a d20 is ever rolled with advantage or disadvantage.
  mode: D20Mode
  at: number
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
  const applied: D20Mode = sides === 20 ? mode : "normal"
  const count = applied === "normal" ? 1 : 2
  const dice = Array.from({ length: count }, () => randomInt(sides))
  const pick = applied === "disadvantage" ? Math.min : Math.max
  const kept = dice.indexOf(pick(...dice))
  return { id: nextId++, sides, modifier, mode: applied, at: Date.now(), dice, kept, total: dice[kept] + modifier }
}

const withModifier = (base: string, modifier: number) =>
  modifier === 0 ? base : `${base} ${modifier > 0 ? "+" : "−"} ${Math.abs(modifier)}`

export const notation = ({ sides, modifier }: Roll) => withModifier(`d${sides}`, modifier)

// "Roll d20 + 2 with advantage", as the tooltip of a die tile says it.
export function rollLabel(sides: Sides, modifier: number, mode: D20Mode) {
  const suffix = sides === 20 && mode !== "normal" ? ` with ${mode}` : ""
  return `Roll ${withModifier(`d${sides}`, modifier)}${suffix}`
}

// "now", "2m", "1h".
export function rollAge(at: number, now: number) {
  const minutes = Math.floor((now - at) / 60000)
  if (minutes < 1) return "now"
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`
}

// What the 3D dice are told to land on, in dice-box-threejs's notation.
export const throwNotation = ({ sides, dice }: Roll) => `${dice.length}d${sides}@${dice.join(",")}`
