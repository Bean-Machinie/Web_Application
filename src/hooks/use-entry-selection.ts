import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { isTyping, rangeBetween } from "@/lib/entry-selection"

type Options = {
  // The ids as shown, in order.
  visibleIds: string[]
  // Every id there is, shown or not.
  allIds: string[]
  // Changes with the view (tab, search, filter): the selection starts over, so
  // nothing out of sight is acted on by accident.
  viewKey: string
  enabled?: boolean
  // Keys count only inside this element, such as a dialog. Without it they
  // count anywhere except under an open dialog or menu.
  container?: RefObject<HTMLElement | null>
}

export type EntrySelection = ReturnType<typeof useEntrySelection>

// Which entries are picked, the way mail and photo apps do it: a click toggles,
// Shift-click takes a range from the last one, Ctrl/Cmd+A takes everything
// shown, Escape lets go.
export function useEntrySelection(options: Options) {
  const { visibleIds, allIds, viewKey, enabled = true, container } = options
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const anchor = useRef<string | null>(null)
  const latest = useRef({ visibleIds, allIds, selected })
  useEffect(() => {
    latest.current = { visibleIds, allIds, selected }
  })

  const [seenView, setSeenView] = useState(viewKey)
  if (seenView !== viewKey) {
    setSeenView(viewKey)
    setSelected(new Set())
    anchor.current = null
  }

  // Entries that no longer exist drop out, such as after deleting them. Keyed
  // by the ids themselves: the array is new on every render.
  const allKey = allIds.join(",")
  useEffect(() => {
    const exists = new Set(latest.current.allIds)
    setSelected((old) => {
      const kept = [...old].filter((id) => exists.has(id))
      return kept.length === old.size ? old : new Set(kept)
    })
  }, [allKey])

  function toggle(id: string) {
    setSelected((old) => {
      const next = new Set(old)
      if (!next.delete(id)) next.add(id)
      return next
    })
    anchor.current = id
  }

  // A click or a tap on an entry or its checkbox.
  function click(id: string, event: { shiftKey: boolean }) {
    const from = anchor.current
    if (event.shiftKey && from && visibleIds.includes(from)) {
      setSelected((old) => new Set([...old, ...rangeBetween(visibleIds, from, id)]))
    } else {
      toggle(id)
    }
  }

  const deselect = (id: string) =>
    setSelected((old) => {
      const next = new Set(old)
      next.delete(id)
      return next
    })
  const set = (ids: Iterable<string>) => setSelected(new Set(ids))
  const clear = () => {
    setSelected(new Set())
    anchor.current = null
  }
  const selectAllVisible = () => set(visibleIds)
  const selectEverything = () => set(allIds)

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      const now = latest.current
      const target = event.target as Node | null
      const inside = container?.current
        ? container.current.contains(target) || target === document.body
        : !document.querySelector('[role="dialog"], [role="menu"]')
      if (!inside) return

      if (event.key === "Escape" && now.selected.size > 0) {
        clear()
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        if (now.visibleIds.length === 0) return
        event.preventDefault()
        set(now.visibleIds)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // clear and set only use state setters and a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, container])

  const shownSelected = visibleIds.filter((id) => selected.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && shownSelected === visibleIds.length

  return {
    selected,
    // In the order shown, so actions run in the order the list reads.
    selectedIds: allIds.filter((id) => selected.has(id)),
    count: selected.size,
    active: selected.size > 0,
    isSelected: (id: string) => selected.has(id),
    allVisibleSelected,
    someVisibleSelected: shownSelected > 0 && !allVisibleSelected,
    // Everything shown is picked and there is more beyond it: offer "all N".
    canSelectEverything: allVisibleSelected && allIds.length > selected.size,
    everythingSelected: allIds.length > visibleIds.length && selected.size === allIds.length,
    total: allIds.length,
    toggle,
    click,
    deselect,
    set,
    clear,
    selectAllVisible,
    selectEverything,
  }
}
