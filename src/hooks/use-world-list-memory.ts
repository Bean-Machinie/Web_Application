import { useEffect, useRef, useState } from "react"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntryKind } from "@/lib/world-kinds"
import {
  clearWorldListReturn,
  isWorldListReturn,
  loadWorldList,
  saveWorldList,
} from "@/lib/world-list-memory"

// Owns the search text of the World list and keeps it, with the scroll
// position, for when the list is opened again after an entry. The tab is in
// the URL and the view mode is stored already. The page scrolls, so that is the
// scroll that is kept; `ready` is true once the entries are there to scroll.
export function useWorldListMemory(
  scopeKey: string,
  kind: WorldEntryKind | null,
  mode: WorldViewMode,
  ready: boolean
) {
  const [saved] = useState(() => (isWorldListReturn() ? loadWorldList(scopeKey) : null))
  const [query, setQuery] = useState(saved?.query ?? "")
  const signature = `${kind ?? "all"}|${mode}|${query}`
  const latest = useRef({ query, signature })
  useEffect(() => {
    latest.current = { query, signature }
  })

  // Used up once the list has opened.
  useEffect(() => {
    clearWorldListReturn()
  }, [])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        saveWorldList(scopeKey, { ...latest.current, scroll: window.scrollY })
      )
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [scopeKey])

  // A new search or tab starts at the top of its list.
  useEffect(() => {
    saveWorldList(scopeKey, { query, scroll: 0, signature })
  }, [scopeKey, query, signature])

  // Back to where it was, once the entries are on screen and only if it is the
  // same list (tab, view and search).
  useEffect(() => {
    if (!ready || !saved || saved.signature !== signature || saved.scroll === 0) return
    let frame = 0
    let tries = 0
    // The page may not be tall enough yet while the entries are still laying out.
    const restore = () => {
      window.scrollTo(0, saved.scroll)
      if (Math.abs(window.scrollY - saved.scroll) > 1 && tries++ < 20) {
        frame = requestAnimationFrame(restore)
      }
    }
    restore()
    return () => cancelAnimationFrame(frame)
    // Only the first time the list is ready; later changes are the person's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return { query, setQuery }
}
