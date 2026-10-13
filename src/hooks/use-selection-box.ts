import { useEffect, useRef, useState } from "react"
import type { PointerEvent, RefObject } from "react"
import { intersects } from "@/lib/entry-selection"

const ITEM = "[data-entry-id]"
// Pressing on any of these is a click on them, not the start of a box.
const IGNORE = `${ITEM}, button, a, input, textarea, select, [role='checkbox'], [role='menuitem']`
const MIN_PX = 4
const EDGE_PX = 48
const MAX_SCROLL_PX = 18

// The box, in the scrolled content's own coordinates, so it grows with the
// scroll as well as with the pointer.
export type SelectionRect = { left: number; top: number; width: number; height: number }

type Options = {
  // The scrolling element that holds the items. It must be position: relative,
  // and the items carry data-entry-id.
  container: RefObject<HTMLElement | null>
  enabled: boolean
  selected: ReadonlySet<string>
  // Called while the box moves with what it touches (plus what was already
  // picked when Shift or Ctrl/Cmd was held).
  onSelect: (ids: string[]) => void
  // A plain click on empty space.
  onClear: () => void
}

// Drag across empty space to pick every item the box touches, as in a file
// manager. Mouse and pen only: on touch, dragging scrolls. Spread
// `onPointerDown` on the container and draw `box` inside it.
export function useSelectionBox(options: Options) {
  const [box, setBox] = useState<SelectionRect | null>(null)
  const latest = useRef(options)
  const stop = useRef<(() => void) | null>(null)
  useEffect(() => {
    latest.current = options
  })
  // A box still being drawn must not outlive the list.
  useEffect(() => () => stop.current?.(), [])

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const { container, enabled, selected } = latest.current
    const element = container.current
    if (!enabled || !element || event.button !== 0 || event.pointerType === "touch") return
    if ((event.target as Element).closest(IGNORE)) return

    const start = element.getBoundingClientRect()
    // Not on the scroll bar.
    if (event.clientX >= start.left + element.clientWidth) return

    const additive = event.shiftKey || event.ctrlKey || event.metaKey
    const base = additive ? [...selected] : []
    const origin = {
      x: event.clientX - start.left + element.scrollLeft,
      y: event.clientY - start.top + element.scrollTop,
    }
    const pointer = { x: event.clientX, y: event.clientY }
    let moved = false
    let frame = 0
    let lastHits = ""
    let lastRect = ""

    const update = () => {
      const bounds = element.getBoundingClientRect()
      const x = pointer.x - bounds.left + element.scrollLeft
      const y = pointer.y - bounds.top + element.scrollTop
      const rect = {
        left: Math.min(origin.x, x),
        top: Math.min(origin.y, y),
        width: Math.abs(x - origin.x),
        height: Math.abs(y - origin.y),
      }
      if (!moved && Math.hypot(rect.width, rect.height) < MIN_PX) return
      moved = true
      const rectKey = `${rect.left},${rect.top},${rect.width},${rect.height}`
      if (rectKey !== lastRect) {
        lastRect = rectKey
        setBox(rect)
      }

      // Items are compared where they are on screen, so the scroll counts.
      const view = {
        left: rect.left - element.scrollLeft + bounds.left,
        top: rect.top - element.scrollTop + bounds.top,
        right: rect.left + rect.width - element.scrollLeft + bounds.left,
        bottom: rect.top + rect.height - element.scrollTop + bounds.top,
      }
      const hits = [...element.querySelectorAll<HTMLElement>(ITEM)]
        .filter((item) => intersects(view, item.getBoundingClientRect()))
        .map((item) => item.dataset.entryId!)
      const key = hits.join(",")
      if (key === lastHits) return
      lastHits = key
      latest.current.onSelect([...new Set([...base, ...hits])])
    }

    // Near the top or bottom edge the list scrolls, so a long list can be
    // swept in one go.
    const tick = () => {
      const bounds = element.getBoundingClientRect()
      const intoTop = bounds.top + EDGE_PX - pointer.y
      const intoBottom = pointer.y - (bounds.bottom - EDGE_PX)
      if (moved && intoTop > 0) {
        element.scrollTop -= Math.min(intoTop / EDGE_PX, 1) * MAX_SCROLL_PX
      } else if (moved && intoBottom > 0) {
        element.scrollTop += Math.min(intoBottom / EDGE_PX, 1) * MAX_SCROLL_PX
      }
      update()
      frame = requestAnimationFrame(tick)
    }

    const onMove = (move: globalThis.PointerEvent) => {
      pointer.x = move.clientX
      pointer.y = move.clientY
    }
    const finish = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      document.body.style.userSelect = ""
      stop.current = null
      setBox(null)
    }
    const onUp = () => {
      const wasClick = !moved
      finish()
      if (wasClick && !additive) latest.current.onClear()
    }

    document.body.style.userSelect = "none"
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    stop.current = finish
    frame = requestAnimationFrame(tick)
  }

  return { onPointerDown, box }
}
