// The rules are one document in one tab, so asking for a term means "open the document and go
// to it". The asker leaves the term here; the document takes it as soon as it is on screen, or at
// once when it already is.
export const RULES_TAB = "glossary"

// `fresh` is true when the document had only just opened and the term was already waiting.
type Go = (termId: string, fresh: boolean) => void

let waiting: string | null = null
const listeners = new Set<(fresh: boolean) => void>()

export function requestRuleScroll(termId: string) {
  waiting = termId
  listeners.forEach((listener) => listener(false))
}

// Calls `go` for a term already waiting, and for each one asked for after. Returns the way to stop.
export function onRuleScroll(go: Go) {
  const run = (fresh: boolean) => {
    const termId = waiting
    waiting = null
    if (termId) go(termId, fresh)
  }
  listeners.add(run)
  run(true)
  return () => void listeners.delete(run)
}
