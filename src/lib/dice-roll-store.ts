import type { D20Mode } from "@/lib/dice"

type Roller = (expression: string, mode: D20Mode) => void

// The one DiceRoller on the page registers itself here, so anything can ask for a roll without
// owning the dice. With no roller on the page, a roll is simply not made.
let roller: Roller | null = null

export function registerRoller(next: Roller) {
  roller = next
  return () => {
    if (roller === next) roller = null
  }
}

export const rollExpression = (expression: string, { mode = "normal" }: { mode?: D20Mode } = {}) => roller?.(expression, mode)
