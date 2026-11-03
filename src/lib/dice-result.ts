import type { Roll } from "@/lib/dice"
import type { DiceStyle } from "@/lib/dice-styles"

export const CRITICAL_COLOR = "#d4af37"
export const FUMBLE_COLOR = "#b4534b"

// Only the kept die of a d20 counts, so a natural 20 on advantage is still one.
export function momentOf(roll: Roll): "critical" | "fumble" | null {
  if (roll.sides !== 20) return null
  const face = roll.dice[roll.kept]
  return face === 20 ? "critical" : face === 1 ? "fumble" : null
}

function luminance(color: string) {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1]
  if (!hex) return 1
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// The result sits on a dark backdrop, so a style whose numerals are dark (ivory, pewter) uses its body colour.
export const numeralColor = (style: DiceStyle) => (luminance(style.foreground) < 0.4 ? style.background : style.foreground)
