import { useCallback, useEffect, useMemo, useState } from "react"
import { useElementSize } from "@/hooks/use-element-size"
import { onRuleScroll } from "@/lib/rules-focus"
import { matchingEntries, ruleEntry } from "@/lib/rules-terms"
import { RuleSource } from "./RuleSource"
import { RuleTermView } from "./RuleTermView"
import { RulesList } from "./RulesList"

// The width of the space the rules have, from which the list and the term sit side by side.
const WIDE_PX = 720

type Props = {
  // The term shown, when the address decides it (the Rules page). Left out, the view keeps its own.
  termId?: string
  // Called with the term picked, or undefined for a way back to the list.
  onSelect?: (termId: string | undefined) => void
}

// The rules: a list of terms and the one picked, side by side where there is room and one at a
// time where there is not. A term asked for from a page (a glossary word) is picked here.
export function RulesDocument({ termId, onSelect }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const [query, setQuery] = useState("")
  const [own, setOwn] = useState<string | undefined>()
  const picked = onSelect ? termId : own
  const select = useCallback((id: string | undefined) => (onSelect ?? setOwn)(id), [onSelect])
  const entries = useMemo(() => matchingEntries(query), [query])
  // The entries read on the way to this one, by following links; the last is the one to go back to.
  const [trail, setTrail] = useState<string[]>([])

  // A term picked from the list, the editor or the address starts a new trail.
  const pick = useCallback(
    (id: string | undefined) => {
      setTrail([])
      select(id)
    },
    [select]
  )

  useEffect(() => {
    const stop = onRuleScroll((id) => pick(id))
    return () => stop()
  }, [pick])

  const wide = size.width >= WIDE_PX
  // Wide, there is always a term beside the list: the first of what is listed.
  const shown = ruleEntry(picked)?.id ?? (wide ? entries[0]?.id : undefined)
  // A link inside a term leaves it on the trail, so each step can be undone in turn.
  const follow = (id: string) => {
    if (shown && id !== shown) setTrail((steps) => [...steps, shown])
    select(id)
  }
  const previous = ruleEntry(trail[trail.length - 1])
  const goBack = () => {
    setTrail((steps) => steps.slice(0, -1))
    select(previous?.id)
  }
  const list = <RulesList query={query} onQuery={setQuery} entries={entries} selectedId={shown} onSelect={pick} />
  // The term scrolls above its source line, which stays at the bottom of the pane.
  const term = shown && (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* Keyed by the term, so each one opens at its top. */}
      <div key={shown} className="min-h-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">
        <RuleTermView
          termId={shown}
          onSelect={follow}
          onBack={wide ? undefined : () => pick(undefined)}
          back={previous && { title: previous.title, go: goBack }}
        />
      </div>
      <RuleSource pages={ruleEntry(shown)!.pages} />
    </div>
  )

  return (
    <div ref={ref} className="flex h-full min-h-0">
      {size.width > 0 &&
        (wide ? (
          <>
            <aside className="w-65 shrink-0 border-r">{list}</aside>
            {term}
          </>
        ) : (
          term || <div className="h-full min-w-0 flex-1">{list}</div>
        ))}
    </div>
  )
}
