import { Fragment } from "react"
import type { ReactNode } from "react"
import { parseExpression } from "@/lib/dice-expression"
import { InlineDice } from "./InlineDice"
import { DICE } from "./rules-decorations"

// Plain text in which the dice (1d20+2) are inline rollable dice. With
// `counted`, only dice with a count are chips.
export function DiceText({ text, counted = false }: { text: string; counted?: boolean }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const found of text.matchAll(DICE)) {
    if (!parseExpression(found[0]) || (counted && !/^\d/.test(found[0]))) continue
    parts.push(
      text.slice(last, found.index),
      <Fragment key={found.index}>
        <InlineDice expression={found[0]}>{found[0]}</InlineDice>
      </Fragment>
    )
    last = found.index + found[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
