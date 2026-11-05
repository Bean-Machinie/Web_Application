import { Fragment } from "react"
import type { ReactNode } from "react"
import { GLOSSARY_TERMS, glossaryIdFor } from "@/lib/glossary-terms"

type Props = { text: string; selfId: string; link: (id: string, label: string) => ReactNode }

// A term's text, with the other glossary terms in it turned into links.
export function RuleLinkedText({ text, selfId, link }: Props) {
  const parts: ReactNode[] = []
  let last = 0
  for (const found of text.matchAll(GLOSSARY_TERMS)) {
    const id = glossaryIdFor(found[0])
    if (!id || id === selfId) continue
    parts.push(text.slice(last, found.index), <Fragment key={found.index}>{link(id, found[0])}</Fragment>)
    last = found.index + found[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
