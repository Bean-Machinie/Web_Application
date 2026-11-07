import { useLayoutEffect, useRef, useState } from "react"
import { usePanelRef } from "react-resizable-panels"
import type { PanelSize } from "react-resizable-panels"
import { useStoredValue } from "@/hooks/use-stored-value"

export const TREE_MIN_PX = 200
export const TREE_MAX_PX = 320
export const RAIL_PX = 48
const TREE_DEFAULT_PX = 224

function readWidth(text: string | null) {
  const width = Number(text)
  return Number.isFinite(width) && width >= TREE_MIN_PX && width <= TREE_MAX_PX ? width : TREE_DEFAULT_PX
}

// The side panel of the journal as a resizable panel that narrows to a rail. The panel
// is the one source of truth for open or not: dragging it past its minimum collapses it
// the same as the button does. Its width and whether it is open are remembered, under the
// prefix, so the library's panel keeps its own. Where nothing is remembered yet it starts open, or narrowed
// to the rail when `startOpen` is false.
export function useJournalSide(prefix = "journal", startOpen = true) {
  const panel = usePanelRef()
  const [open, setOpen] = useStoredValue(`${prefix}-tree-open`, (text) => (text === null ? startOpen : text !== "false"))
  const [width, setWidth] = useStoredValue(`${prefix}-tree-width`, readWidth)
  const lastWidth = useRef(width)
  const element = useRef<HTMLDivElement>(null)
  // The width only eases while a button moves it; during a drag it must follow the pointer.
  // The panel gets its easing first and moves on the next step, or it would just jump.
  const [request, setRequest] = useState<{ open: boolean } | null>(null)

  useLayoutEffect(() => {
    if (!request) return
    element.current?.getBoundingClientRect()
    if (request.open) panel.current?.expand()
    else panel.current?.collapse()
    const timer = setTimeout(() => setRequest(null), 250)
    return () => clearTimeout(timer)
  }, [request, panel])

  function onResize(size: PanelSize) {
    const nowOpen = size.inPixels > RAIL_PX + 1
    if (nowOpen) lastWidth.current = Math.round(size.inPixels)
    if (nowOpen !== open) setOpen(nowOpen)
  }

  // Called when a drag ends, so the width is written once and not on every move.
  function saveWidth() {
    if (open && lastWidth.current !== width) setWidth(lastWidth.current)
  }

  const toggle = (next: boolean) => setRequest({ open: next })

  return { panel, element, open, width, easing: request !== null, onResize, saveWidth, toggle }
}
