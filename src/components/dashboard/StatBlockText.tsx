import { Fragment } from "react"
import type { ReactNode } from "react"
import { rollExpression } from "@/lib/dice-roll-store"
import { CHIP_CLASS, chipTitle } from "./rules-decorations"
import { RuleText } from "./RuleText"

// An attack bonus after "Attack Roll:" (+4), or dice with their modifier (1d6 + 2).
const ROLLABLE = /(?<=Attack Roll: )[+-]\d+|\b\d*d(?:100|12|10|20|4|6|8)(?:\s[+-]\s\d+)?/g

type Props = { text: string; onRule: (termId: string) => void }

// The text of a trait or action: dice and attack bonuses are chips that roll (a bonus rolls a d20
// with it), and the SRD's own words link to the rules.
export function StatBlockText({ text, onRule }: Props) {
  const parts: ReactNode[] = []
  const plain = (part: string, key: string) => <RuleText key={key} text={part} selfId="" onSelect={onRule} dice={false} />
  let last = 0
  for (const found of text.matchAll(ROLLABLE)) {
    const shown = found[0]
    const expression = /^[+-]/.test(shown) ? `d20${shown}` : shown.replace(/\s/g, "")
    parts.push(
      plain(text.slice(last, found.index), `t${found.index}`),
      <Fragment key={found.index}>
        <button
          type="button"
          className={CHIP_CLASS}
          title={chipTitle(expression)}
          onClick={(event) => rollExpression(expression, { mode: event.shiftKey ? "advantage" : event.altKey ? "disadvantage" : "normal" })}
        >
          {shown}
        </button>
      </Fragment>
    )
    last = found.index + shown.length
  }
  parts.push(plain(text.slice(last), "rest"))
  return <>{parts}</>
}
