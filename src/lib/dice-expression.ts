import { DICE, rollDice, rollTerms } from "@/lib/dice"
import type { D20Mode, Roll, Sides, Term } from "@/lib/dice"

const MAX_DICE = 20
const DIE = "\\d{0,2}d(?:100|10|12|20|4|6|8)"

// Dice added together, then one flat modifier: d20, 2d6, 1d8+3, 2d6+1d4-1. No spaces, so prose
// like "2d6 - 1 day" is left alone.
export const DICE_EXPRESSION = `${DIE}(?:\\+${DIE})*(?:[+-]\\d{1,3})?`

export type Expression = { terms: Term[]; modifier: number }

export function parseExpression(text: string): Expression | null {
  const terms: Term[] = []
  let modifier = 0
  for (const part of text.toLowerCase().replace(/-/g, "+-").split("+")) {
    const die = part.match(/^(\d*)d(\d+)$/)
    if (die) {
      const count = die[1] === "" ? 1 : Number(die[1])
      const sides = Number(die[2]) as Sides
      if (count < 1 || !DICE.includes(sides)) return null
      terms.push({ count, sides })
    } else if (/^-?\d+$/.test(part)) modifier += Number(part)
    else if (part !== "") return null
  }
  const total = terms.reduce((sum, term) => sum + term.count, 0)
  if (terms.length === 0 || total > MAX_DICE) return null
  // A d100 is two dice on the table, so it is only rolled by itself.
  if (terms.some((term) => term.sides === 100) && (terms.length > 1 || terms[0].count > 1)) return null
  return { terms, modifier }
}

const isSingleDie = ({ terms }: Expression) => terms.length === 1 && terms[0].count === 1

// Only a lone d20 (with or without a modifier) can be rolled with advantage or disadvantage.
export function takesMode(text: string) {
  const parsed = parseExpression(text)
  return !!parsed && isSingleDie(parsed) && parsed.terms[0].sides === 20
}

export function rollText(text: string, mode: D20Mode): Roll | null {
  const parsed = parseExpression(text)
  if (!parsed) return null
  return isSingleDie(parsed) ? rollDice(parsed.terms[0].sides, parsed.modifier, mode) : rollTerms(parsed.terms, parsed.modifier)
}
