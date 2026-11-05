import { pinKept, takeForced } from "@/lib/dice-dev"

export const DICE =[4, 6, 8, 10, 12, 20, 100] as const
export type Sides = (typeof DICE)[number]
export type D20Mode = "normal" | "advantage" | "disadvantage"
export const MODE_NAMES: Record<D20Mode, string> = { normal: "", advantage: "Advantage", disadvantage: "Disadvantage" }

export type Roll = {
  id: number
  sides: Sides
  modifier: number
  // Only a d20 is ever rolled with advantage or disadvantage.
  mode: D20Mode
  at: number
  // Every die thrown; on advantage or disadvantage the kept one is at `kept`. A d100 is two:
  // the tens (00 to 90) and the units (0 to 9).
  dice: number[]
  kept: number
  total: number
  // Set for an expression of several dice, like 2d6+1d4: every die is added, none is kept or dropped.
  terms?: Term[]
}

export type Term = { count: number; sides: Sides }

// Uniform in 1..sides: values that would favour the low numbers are thrown away.
function randomInt(sides: number) {
  const limit = 0x100000000 - (0x100000000 % sides)
  const buffer = new Uint32Array(1)
  do crypto.getRandomValues(buffer)
  while (buffer[0] >= limit)
  return (buffer[0] % sides) + 1
}

let nextId = 0

// 1 to 100 as the percentile die and the d10 show it: 47 is 40 and 7, and 100 is 00 and 0.
function rollPercentile(modifier: number): Roll {
  const value = (import.meta.env.DEV ? takeForced(100) : null) ?? randomInt(100)
  const dice = [(Math.floor(value / 10) * 10) % 100, value % 10]
  return { id: nextId++, sides: 100, modifier, mode: "normal", at: Date.now(), dice, kept: 0, total: value + modifier }
}

export function rollDice(sides: Sides, modifier: number, mode: D20Mode): Roll {
  if (sides === 100) return rollPercentile(modifier)
  const applied: D20Mode = sides === 20 ? mode : "normal"
  const count = applied === "normal" ? 1 : 2
  const dice = Array.from({ length: count }, () => randomInt(sides))
  const pick = applied === "disadvantage" ? Math.min : Math.max
  const kept = dice.indexOf(pick(...dice))
  const forced = import.meta.env.DEV ? takeForced(sides) : null
  if (forced !== null) pinKept(dice, kept, applied, forced)
  return { id: nextId++, sides, modifier, mode: applied, at: Date.now(), dice, kept, total: dice[kept] + modifier }
}

export function rollTerms(terms: Term[], modifier: number): Roll {
  const dice = terms.flatMap(({ count, sides }) => Array.from({ length: count }, () => randomInt(sides)))
  const sum = dice.reduce((total, die) => total + die, 0)
  return { id: nextId++, sides: terms[0].sides, modifier, mode: "normal", at: Date.now(), dice, kept: 0, total: sum + modifier, terms }
}

const withModifier = (base: string, modifier: number) =>
  modifier === 0 ? base : `${base} ${modifier > 0 ? "+" : "−"} ${Math.abs(modifier)}`

export const notation = ({ sides, modifier, terms }: Roll) =>
  withModifier(terms ? terms.map(({ count, sides: faces }) => `${count}d${faces}`).join(" + ") : `d${sides}`, modifier)

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
export const throwNotation = ({ sides, dice, terms }: Roll) =>
  terms ? `${terms.map(({ count, sides: faces }) => `${count}d${faces}`).join("+")}@${dice.join(",")}` : sides === 100 ? `1d100+1d10@${dice.join(",")}` : `${dice.length}d${sides}@${dice.join(",")}`
