import type { Roll } from "@/lib/dice"
import type { DiceStyle } from "@/lib/dice-styles"

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

// Only the d20 and the d100 have moments, on their highest and lowest faces. Only the kept die of a d20 counts,
// so a natural 20 on advantage is still one.
export function momentOf(roll: Roll): Moment | null {
  if (roll.sides !== 20 && roll.sides !== 100) return null
  const face = faceOf(roll)
  return face === roll.sides ? "critical" : face === 1 ? "fumble" : null
}

const rgbOf = (color: string) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(color === "white" ? "#ffffff" : color)?.[1]
  return hex ? [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16)) : null
}

function luminance(color: string) {
  const rgb = rgbOf(color)
  if (!rgb) return 1
  const [r, g, b] = rgb.map((channel) => channel / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// A roll on the low half of its die leans toward red and on the high half toward gold, more the further out
// it is: a 2 reads as poor next to a 19, and the middle keeps the style's own colour. The strongest ends
// are left to the moments.
export function tintOf(roll: Roll, base: string) {
  const from = rgbOf(base)
  if (!from) return base
  const spread = ((faceOf(roll) - 1) / (roll.sides - 1)) * 2 - 1
  const toward = rgbOf(spread < 0 ? FUMBLE_COLOR : CRITICAL_COLOR)
  if (!toward) return base
  const amount = Math.abs(spread) * 0.55
  return `rgb(${from.map((channel, at) => Math.round(channel + (toward[at] - channel) * amount)).join(" ")})`
}

// The result sits on a dark backdrop, so a style whose numerals are dark (ivory, pewter) uses its body colour.
export const numeralColor = (style: DiceStyle) => (luminance(style.foreground) < 0.4 ? style.background : style.foreground)
