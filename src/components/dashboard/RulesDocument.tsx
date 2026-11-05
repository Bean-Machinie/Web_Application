import { useMemo, useState } from "react"
import { useRuleJump } from "@/hooks/use-rule-jump"
import { GAME_NOTICES } from "@/lib/legal-notices"
import { groupByLetter, matchingTerms } from "@/lib/rules-terms"
import { NoticeText } from "./NoticeText"
import { RuleEntry } from "./RuleEntry"
import { RulesBar } from "./RulesBar"

const NOTICE = GAME_NOTICES.find((notice) => notice.id === "dnd-5e-2024")!
const letterAnchor = (letter: string) => `rule-letter-${letter}`

type Props = {
  // A term to go to when the document opens, from the address.
  initialTerm?: string
  // Where a click on a linked term goes. Left out, the document scrolls to it itself.
  onVisit?: (termId: string) => void
}

// The rules as one page, A to Z, like a dictionary: a click on a term anywhere opens this and
// scrolls to its entry. It is the same in a journal tab and on the Rules page.
export function RulesDocument({ initialTerm, onVisit }: Props) {
  const [query, setQuery] = useState("")
  const { highlighted, jump } = useRuleJump(initialTerm)
  const groups = useMemo(() => groupByLetter(matchingTerms(query)), [query])

  const scrollToLetter = (letter: string) =>
    document.getElementById(letterAnchor(letter))?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="px-4 pb-12 md:px-8">
      <RulesBar query={query} onQuery={setQuery} letters={groups.map((group) => group.letter)} onLetter={scrollToLetter} />
      <div className="mx-auto max-w-2xl">
        <header className="pt-6 pb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Rules</h1>
          <p className="text-muted-foreground mt-1 text-sm">D&amp;D 5e terms from the SRD 5.2.1, A to Z.</p>
        </header>
        {groups.length === 0 && <p className="text-muted-foreground py-8 text-sm">Nothing matches “{query}”.</p>}
        {groups.map(({ letter, terms }) => (
          <div key={letter}>
            <h2 id={letterAnchor(letter)} className="text-muted-foreground mt-6 scroll-mt-28 border-b pb-1 text-sm font-medium">
              {letter}
            </h2>
            {terms.map((term) => (
              <RuleEntry key={term.id} term={term} highlighted={highlighted === term.id} onVisit={onVisit ?? jump} />
            ))}
          </div>
        ))}
        <footer className="text-muted-foreground mt-12 border-t pt-4 text-xs leading-relaxed">
          <NoticeText text={NOTICE.notice} />
        </footer>
      </div>
    </div>
  )
}
