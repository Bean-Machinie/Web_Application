import { Fragment } from "react"
import type { ReactNode } from "react"
import { GLOSSARY_TERMS, glossaryIdFor } from "@/lib/glossary-terms"
import { DiceText } from "./DiceText"

type Props = { text: string; selfId: string; onSelect: (termId: string) => void; dice?: boolean }

// One block of the rules' text: the other entries' titles in it are links (the first time each
// appears, never the entry's own), and dice roll inline.
export function RuleText({ text, selfId, onSelect, dice = true }: Props) {
  // Dice are chips only where the text is a rule to use, and only with a count (1d4, never d20).
  const plain = (part: string, key: string) => (dice ? <DiceText key={key} text={part} counted /> : <Fragment key={key}>{part}</Fragment>)
  const parts: ReactNode[] = []
  const linked = new Set<string>()
  let last = 0
  for (const found of text.matchAll(GLOSSARY_TERMS)) {
    const id = glossaryIdFor(found[0])
    if (!id || id === selfId || linked.has(id)) continue
    linked.add(id)
    parts.push(
      plain(text.slice(last, found.index), `t${found.index}`),
      <Fragment key={found.index}>
        <button
          type="button"
          onClick={() => onSelect(id)}
          className="decoration-muted-foreground/60 hover:decoration-foreground cursor-pointer underline decoration-dotted underline-offset-4"
        >
          {found[0]}
        </button>
      </Fragment>
    )
    last = found.index + found[0].length
  }
  parts.push(plain(text.slice(last), "rest"))
  return <>{parts}</>
}
