import { useEffect, useRef, useState } from "react"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntryKind } from "@/lib/world-kinds"
import {
  clearWorldListReturn,
  isWorldListReturn,
  loadWorldList,
  saveWorldList,
} from "@/lib/world-list-memory"

const SCROLL_SELECTOR = "[data-world-scroll]"

// Owns the search text of the World list and keeps it, with the scroll
// position, for when the list is opened again after an entry. The tab is in
// the URL and the view mode is stored already. Put `wrapper` on the element
// that holds the toolbar and the results; `ready` is true once the entries are
// there to scroll.
export function useWorldListMemory(
  campaignId: string,
  kind: WorldEntryKind | null,
  mode: WorldViewMode,
  ready: boolean
) {
  const [saved] = useState(() => (isWorldListReturn() ? loadWorldList(campaignId) : null))
  const [query, setQuery] = useState(saved?.query ?? "")
  const wrapper = useRef<HTMLDivElement>(null)
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
    const element = wrapper.current
    if (!element) return
    let frame = 0
    const onScroll = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(SCROLL_SELECTOR)) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        saveWorldList(campaignId, { ...latest.current, scroll: target.scrollTop })
      )
    }
    // Scroll does not bubble, but it can be caught on the way down.
    element.addEventListener("scroll", onScroll, true)
    return () => {
      element.removeEventListener("scroll", onScroll, true)
      cancelAnimationFrame(frame)
    }
  }, [campaignId])

  // A new search or tab starts at the top of its list.
  useEffect(() => {
    saveWorldList(campaignId, { query, scroll: 0, signature })
  }, [campaignId, query, signature])

  // Back to where it was, once the entries are on screen and only if it is the
  // same list (tab, view and search).
  useEffect(() => {
    if (!ready || !saved || saved.signature !== signature || saved.scroll === 0) return
    let frame = 0
    let tries = 0
    const restore = () => {
      const target = wrapper.current?.querySelector<HTMLElement>(SCROLL_SELECTOR)
      if (target) target.scrollTop = saved.scroll
      else if (tries++ < 20) frame = requestAnimationFrame(restore)
    }
    restore()
    return () => cancelAnimationFrame(frame)
    // Only the first time the list is ready; later changes are the person's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return { query, setQuery, wrapper }
}
