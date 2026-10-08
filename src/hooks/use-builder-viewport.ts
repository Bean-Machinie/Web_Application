import { useCallback, useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import type Konva from "konva"

export type BuilderView = { x: number; y: number; scale: number }

// Room around the canvas when it is fitted.
const MARGIN = 56
// Close enough to place single pixels of a canvas.
const MAX_SCALE = 8
// Far enough out to see the canvas small, never lost.
const MIN_OF_FIT = 0.4
// Panning and zooming move the stage directly, and React hears of the new view
// only once the movement has been still for this long.
const SETTLE_MS = 100

type Size = { width: number; height: number }

// Pan and zoom of the builder's canvas inside its container: the stage is
// sized to the container and the canvas is moved and scaled within it. It
// starts fitted, and the wheel zooms around the pointer. While a gesture goes on
// the stage is moved directly, as redrawing the page on every step is slow with
// much art on it; "view" catches up when it stops.
export function useBuilderViewport(canvas: Size, stage: RefObject<Konva.Stage | null>) {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [view, setView] = useState<BuilderView>({ x: 0, y: 0, scale: 1 })
  const placed = useRef(false)
  // Where the view really is, ahead of "view" while a gesture goes on.
  const live = useRef(view)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useLayoutEffect(() => {
    live.current = view
  }, [view])

  const moveTo = useCallback(
    (next: BuilderView) => {
      live.current = next
      const target = stage.current
      if (!target) return setView(next)
      target.position({ x: next.x, y: next.y })
      target.scale({ x: next.scale, y: next.scale })
      target.batchDraw()
      clearTimeout(settle.current)
      settle.current = setTimeout(() => setView(live.current), SETTLE_MS)
    },
    [stage]
  )

  const fitted = useCallback(
    (box: Size): BuilderView => {
      const scale = Math.min(
        (box.width - MARGIN * 2) / canvas.width,
        (box.height - MARGIN * 2) / canvas.height
      )
      return {
        scale,
        x: (box.width - canvas.width * scale) / 2,
        y: (box.height - canvas.height * scale) / 2,
      }
    },
    [canvas.width, canvas.height]
  )

  useLayoutEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const box = { width: element.clientWidth, height: element.clientHeight }
      setSize(box)
      if (!placed.current && box.width > 0) {
        placed.current = true
        setView(fitted(box))
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [fitted])

  const zoomAt = useCallback(
    (point: { x: number; y: number }, factor: number) => {
      const old = live.current
      const min = fitted(size).scale * MIN_OF_FIT
      const scale = Math.min(Math.max(old.scale * factor, min), MAX_SCALE)
      const ratio = scale / old.scale
      moveTo({
        scale,
        x: point.x - (point.x - old.x) * ratio,
        y: point.y - (point.y - old.y) * ratio,
      })
    },
    [fitted, size, moveTo]
  )

  const onWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault()
      const pointer = event.target.getStage()?.getPointerPosition()
      if (!pointer) return
      // A trackpad pinch arrives as a wheel with ctrl held, in small steps.
      const rate = event.evt.ctrlKey ? 0.01 : 0.0015
      zoomAt(pointer, Math.exp(-event.evt.deltaY * rate))
    },
    [zoomAt]
  )

  // Dragging with the middle button pans whatever the tool, so drawing never
  // has to be put down to move around.
  const onMiddlePan = useCallback((event: React.PointerEvent) => {
    if (event.button !== 1) return
    event.preventDefault()
    let last = { x: event.clientX, y: event.clientY }
    const move = (next: PointerEvent) => {
      const dx = next.clientX - last.x
      const dy = next.clientY - last.y
      last = { x: next.clientX, y: next.clientY }
      moveTo({ ...live.current, x: live.current.x + dx, y: live.current.y + dy })
    }
    const end = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
  }, [moveTo])

  // The middle of what is in view, on the canvas.
  const centre = useCallback(
    () =>
      // Before the view is measured, the middle of the canvas.
      size.width === 0
        ? { x: canvas.width / 2, y: canvas.height / 2 }
        : {
            x: (size.width / 2 - live.current.x) / live.current.scale,
            y: (size.height / 2 - live.current.y) / live.current.scale,
          },
    [size, canvas.width, canvas.height]
  )

  return {
    container,
    centre,
    onMiddlePan,
    size,
    view,
    fit: () => setView(fitted(size)),
    zoomBy: (factor: number) => zoomAt({ x: size.width / 2, y: size.height / 2 }, factor),
    onWheel,
    onPan: (x: number, y: number) => setView((old) => ({ ...old, x, y })),
  }
}
