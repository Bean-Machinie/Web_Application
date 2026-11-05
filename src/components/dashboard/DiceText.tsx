import { Fragment } from "react"
import type { ReactNode } from "react"
import { parseExpression } from "@/lib/dice-expression"
import { rollExpression } from "@/lib/dice-roll-store"
import { CHIP_CLASS, DICE, chipTitle } from "./rules-decorations"

// Plain text in which the dice (1d20+2) are the same rollable chips as in a journal page. With
// `counted`, only dice with a count are chips.
export function DiceText({ text, counted = false }: { text: string; counted?: boolean }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const found of text.matchAll(DICE)) {
    if (!parseExpression(found[0]) || (counted && !/^\d/.test(found[0]))) continue
    parts.push(
      text.slice(last, found.index),
      <Fragment key={found.index}>
        <button
          type="button"
          className={CHIP_CLASS}
          title={chipTitle(found[0])}
          onClick={(event) => rollExpression(found[0], { mode: event.shiftKey ? "advantage" : event.altKey ? "disadvantage" : "normal" })}
        >
          {found[0]}
        </button>
      </Fragment>
    )
    last = found.index + found[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
