import type { Roll } from "@/lib/dice"

export const CRITICAL_COLOR = "#d4af37"
export const FUMBLE_COLOR = "#b4534b"

export type Moment = "critical" | "fumble"

// How long a result stays on screen; the moments have more to show, so they stay longer.
export const holdOf = (roll: Roll) => ({ critical: 3000, fumble: 3000, none: 2000 })[momentOf(roll) ?? "none"]

// What the die itself showed, which neither the modifier nor the total changes: the kept die, or the
// percentile die and the d10 together (the two zeros are 100).
export function faceOf(roll: Roll) {
  if (roll.sides === 100) return roll.dice[0] + roll.dice[1] || 100
  return roll.dice[roll.kept]
}

// Only a natural 20 or a natural 1 on a d20 is a moment, and only the kept die counts, so a natural 20 on
// advantage is still one. What counts as a critical depends on the game system (in Call of Cthulhu, for
// instance, 01 on a d100 is a critical and 100 a fumble), so this is the one place to make it system-aware.
// Until then the d100 only gets the normal tint, like the other dice.
export function momentOf(roll: Roll): Moment | null {
  if (roll.sides !== 20) return null
  const face = faceOf(roll)
  return face === 20 ? "critical" : face === 1 ? "fumble" : null
}

const rgbOf = (hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16))

// The result's own fixed scale, whatever the dice style: neutral in the middle, red for a low roll and gold
// for a high one. The style only ever colours the 3D dice.
const NEUTRAL = rgbOf("#e9e7e2")
const LOW = rgbOf("#c0544b")
const HIGH = rgbOf("#e0b84a")

// How far a roll sits from the middle of its die, from neutral to the end of the scale. A 2 reads as poor
// next to a 19 on any die; the d20 and the d100 hand their very ends over to the moments.
export function tintOf(roll: Roll) {
  const spread = ((faceOf(roll) - 1) / (roll.sides - 1)) * 2 - 1
  const end = spread < 0 ? LOW : HIGH
  return `rgb(${NEUTRAL.map((channel, at) => Math.round(channel + (end[at] - channel) * Math.abs(spread))).join(" ")})`
}
