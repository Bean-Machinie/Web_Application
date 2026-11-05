import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { onRuleScroll } from "@/lib/rules-focus"

const HIGHLIGHT_MS = 1800

const RUN_UP_PX = 220

export const ruleAnchor = (termId: string) => `rule-${termId}`

function scrollParent(element: HTMLElement | null) {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

// Scrolls the document to a term and marks it for a moment, so the eye finds it. Terms asked for
// from elsewhere (a chip in a page) arrive through the same path. When the document has only just
// opened it starts at the term, with no long scroll down from the top; once it is open, a jump glides.
export function useRuleJump(initial?: string) {
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const timer = useRef<number>(undefined)

  const jump = useCallback((termId: string, smooth = true) => {
    const go = (behavior: ScrollBehavior) => document.getElementById(ruleAnchor(termId))?.scrollIntoView({ behavior, block: "start" })
    if (smooth) window.setTimeout(() => go("smooth"), 60)
    else {
      // Opens a little above the term, and then settles onto it: enough to read as movement,
      // not the long run down from the top.
      // From the top every time, whatever the tab was scrolled to before, so the run is the same for every term.
      const box = scrollParent(document.getElementById(ruleAnchor(termId)))
      box?.scrollTo({ top: 0, behavior: "instant" })
      go("instant")
      box?.scrollBy({ top: -RUN_UP_PX, behavior: "instant" })
      window.setTimeout(() => go("smooth"), 60)
    }
    setHighlighted(termId)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHighlighted(null), HIGHLIGHT_MS)
  }, [])

  // Before the first paint, so the top of the document is never seen on the way.
  useLayoutEffect(() => onRuleScroll((termId, fresh) => jump(termId, !fresh)), [jump])
  const opened = useRef(false)
  useLayoutEffect(() => {
    // Only the address the page opened with starts there; a later change glides.
    if (initial) jump(initial, opened.current)
    opened.current = true
  }, [initial, jump])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { highlighted, jump }
}
