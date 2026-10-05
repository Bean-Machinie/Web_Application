import { useCallback, useLayoutEffect, useRef, useState } from "react"
import type Konva from "konva"

export type BuilderView = { x: number; y: number; scale: number }

// Room around the canvas when it is fitted.
const MARGIN = 56
// Close enough to place single pixels of a canvas.
const MAX_SCALE = 8
// Far enough out to see the canvas small, never lost.
const MIN_OF_FIT = 0.4

type Size = { width: number; height: number }

// Pan and zoom of the builder's canvas inside its container: the stage is
// sized to the container and the canvas is moved and scaled within it. It
// starts fitted, and the wheel zooms around the pointer.
export function useBuilderViewport(canvas: Size) {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [view, setView] = useState<BuilderView>({ x: 0, y: 0, scale: 1 })
  const placed = useRef(false)

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
      setView((old) => {
        const min = fitted(size).scale * MIN_OF_FIT
        const scale = Math.min(Math.max(old.scale * factor, min), MAX_SCALE)
        const ratio = scale / old.scale
        return {
          scale,
          x: point.x - (point.x - old.x) * ratio,
          y: point.y - (point.y - old.y) * ratio,
        }
      })
    },
    [fitted, size]
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
      setView((old) => ({ ...old, x: old.x + dx, y: old.y + dy }))
    }
    const end = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
  }, [])

  return {
    container,
    onMiddlePan,
    size,
    view,
    fit: () => setView(fitted(size)),
    zoomBy: (factor: number) => zoomAt({ x: size.width / 2, y: size.height / 2 }, factor),
    onWheel,
    onPan: (x: number, y: number) => setView((old) => ({ ...old, x, y })),
  }
}
