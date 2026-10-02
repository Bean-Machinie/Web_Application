import { useEffect, useRef, useState } from "react"
import type { PointerEvent } from "react"
import { locate, measure, rowStyle, scrollParent, SETTLE_MS, viewport } from "@/lib/row-reorder"
import type { Drag, Point } from "@/lib/row-reorder"

const HOLD_MS = 90
// Moving this far before the hold completes means a click or a scroll.
const SLOP_PX = 5
const EDGE_PX = 72
const MAX_SCROLL_PX = 16
const CONTROLS = "button, input, select, textarea, [role='switch']"

type Gesture = {
  id: string
  from: number
  pointerId: number
  startX: number
  startY: number
  startScroll: number
  clientX: number
  clientY: number
  slots: Point[]
  over: number
  scroller: HTMLElement
  active: boolean
  timer: number
  frame: number
  off: (() => void)[]
}

type Options = {
  // The ids of the rows as shown, in order.
  ids: string[]
  // Rows can be reordered only when this is given.
  onReorder?: (ids: string[]) => void
  // Items may move sideways too, as in a grid.
  grid?: boolean
}

// Press and hold a row or card, then drag it; the others slide out of the way.
// Spread rowProps(id, index) onto each row.
export function useRowReorder({ ids, onReorder, grid = false }: Options) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const rows = useRef(new Map<string, HTMLElement>())
  const gesture = useRef<Gesture | null>(null)
  const latest = useRef({ ids, onReorder, drag })
  useEffect(() => {
    latest.current = { ids, onReorder, drag }
  })

  function track(g: Gesture) {
    const moveX = grid ? g.clientX - g.startX : 0
    const moveY = g.clientY - g.startY + g.scroller.scrollTop - g.startScroll
    const { over, dx, dy } = locate(g.slots, g.from, moveX, moveY)
    g.over = over
    setDrag({ id: g.id, from: g.from, over, dx, dy, slots: g.slots, settling: false })
  }

  function autoScroll(g: Gesture) {
    if (!g.active) return
    const { top, bottom } = viewport(g.scroller)
    const intoTop = top + EDGE_PX - g.clientY
    const intoBottom = g.clientY - (bottom - EDGE_PX)
    const depth = intoTop > 0 ? -intoTop : Math.max(intoBottom, 0)
    if (depth !== 0) {
      g.scroller.scrollTop += Math.sign(depth) * Math.min(Math.abs(depth) / EDGE_PX, 1) * MAX_SCROLL_PX
      track(g)
    }
    g.frame = requestAnimationFrame(() => autoScroll(g))
  }

  function end(g: Gesture, commit: boolean) {
    window.clearTimeout(g.timer)
    cancelAnimationFrame(g.frame)
    g.off.forEach((remove) => remove())
    gesture.current = null
    if (!g.active) return

    // The release would otherwise count as a click on the row's link.
    const swallow = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("click", swallow, { capture: true, once: true })
    window.setTimeout(() => window.removeEventListener("click", swallow, true), 50)

    const over = commit ? g.over : g.from
    const dx = g.slots[over].x - g.slots[g.from].x
    const dy = g.slots[over].y - g.slots[g.from].y
    setDrag({ id: g.id, from: g.from, over, dx, dy, slots: g.slots, settling: true })
    window.setTimeout(() => {
      const { ids: current, onReorder: save } = latest.current
      if (over !== g.from && save) {
        const next = current.filter((id) => id !== g.id)
        next.splice(over, 0, g.id)
        save(next)
      }
      setDrag(null)
    }, SETTLE_MS)
  }

  function begin(event: PointerEvent<HTMLElement>, id: string, index: number) {
    const row = rows.current.get(id)
    if (!row) return
    const scroller = scrollParent(row)
    const slots = measure(latest.current.ids, rows.current, scroller)
    if (!slots) return
    const g: Gesture = {
      id,
      from: index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScroll: scroller.scrollTop,
      clientX: event.clientX,
      clientY: event.clientY,
      slots,
      over: index,
      scroller,
      active: false,
      timer: 0,
      frame: 0,
      off: [],
    }
    gesture.current = g

    const on = <T extends Event>(type: string, handler: (e: T) => void, options?: AddEventListenerOptions) => {
      window.addEventListener(type, handler as EventListener, options)
      g.off.push(() => window.removeEventListener(type, handler as EventListener, options))
    }
    on<globalThis.PointerEvent>("pointermove", (e) => {
      if (e.pointerId !== g.pointerId) return
      g.clientX = e.clientX
      g.clientY = e.clientY
      if (g.active) return track(g)
      if (Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > SLOP_PX) end(g, false)
    })
    on<globalThis.PointerEvent>("pointerup", (e) => e.pointerId === g.pointerId && end(g, true))
    on<globalThis.PointerEvent>("pointercancel", (e) => e.pointerId === g.pointerId && end(g, false))
    on<KeyboardEvent>("keydown", (e) => e.key === "Escape" && end(g, false))
    on<Event>("contextmenu", (e) => e.preventDefault())
    // Keeps a held finger from turning into a page scroll.
    on<TouchEvent>("touchmove", (e) => g.active && e.preventDefault(), { passive: false })

    g.timer = window.setTimeout(() => {
      g.active = true
      track(g)
      autoScroll(g)
    }, HOLD_MS)
  }

  const dragging = drag !== null
  useEffect(() => {
    const body = document.body
    if (!dragging) return
    body.style.cursor = "grabbing"
    body.style.userSelect = "none"
    return () => {
      body.style.cursor = ""
      body.style.userSelect = ""
    }
  }, [dragging])

  useEffect(() => () => {
    if (gesture.current) end(gesture.current, false)
  }, [])

  function rowProps(id: string, index: number) {
    return {
      ref: (el: HTMLElement | null) => {
        if (el) rows.current.set(id, el)
        else rows.current.delete(id)
      },
      style: rowStyle(drag, id, index),
      // Marks the lifted row so the table can draw its border and shadow.
      "data-lifted": drag?.id === id ? "" : undefined,
      onDragStart: (event: { preventDefault: () => void }) => event.preventDefault(),
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!onReorder || gesture.current || latest.current.drag) return
        if (event.button !== 0 || (event.target as Element).closest(CONTROLS)) return
        begin(event, id, index)
      },
    }
  }

  return { rowProps }
}
