import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import { flipped, holdingAt, stageProps, toCanvas, turnedExtent, turnedTo } from "@/lib/view-matrix"
import type { BuilderView } from "@/lib/view-matrix"
import { useRotateDrag } from "./use-rotate-drag"

export type { BuilderView }

const UPRIGHT = { rotation: 0, flipH: false, flipV: false }
// One press of a rotate key.
const TURN_STEP = 15

// Room around the canvas when it is fitted.
const MARGIN = 56
// The least a fitted canvas is ever shown at, in a window with no room.
const MIN_FIT_SCALE = 0.02
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
export function useBuilderViewport(
  canvas: Size,
  stage: RefObject<Konva.Stage | null>,
  // How much of the container's left side a docked panel covers: fitting and
  // zooming by buttons use the part that can be seen.
  inset: number
) {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [view, setView] = useState<BuilderView>({ x: 0, y: 0, scale: 1, ...UPRIGHT })
  const placed = useRef(false)
  // Where the view really is, ahead of "view" while a gesture goes on.
  const live = useRef(view)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Whoever wants the view as it moves, which "view" does not say until it stops
  // (the navigator's rectangle).
  const watchers = useRef(new Set<(view: BuilderView) => void>())
  useLayoutEffect(() => {
    live.current = view
    watchers.current.forEach((watcher) => watcher(view))
  }, [view])

  const moveTo = useCallback(
    (next: BuilderView) => {
      live.current = next
      watchers.current.forEach((watcher) => watcher(next))
      const target = stage.current
      if (!target) return setView(next)
      target.setAttrs(stageProps(next))
      target.batchDraw()
      clearTimeout(settle.current)
      settle.current = setTimeout(() => setView(live.current), SETTLE_MS)
    },
    [stage]
  )

  // The canvas whole in the part that can be seen, as turned and mirrored as given.
  const fitted = useCallback(
    (box: Size, turn: Pick<BuilderView, "rotation" | "flipH" | "flipV">): BuilderView => {
      const seen = box.width - inset
      const extent = turnedExtent(canvas, turn.rotation)
      // A window too small for the margins would fit the canvas at a negative size.
      const scale = Math.max(
        Math.min((seen - MARGIN * 2) / extent.width, (box.height - MARGIN * 2) / extent.height),
        MIN_FIT_SCALE
      )
      const middle = { x: inset + seen / 2, y: box.height / 2 }
      return holdingAt({ x: 0, y: 0, scale, ...turn }, { x: canvas.width / 2, y: canvas.height / 2 }, middle)
    },
    [canvas, inset]
  )

  useLayoutEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const box = { width: element.clientWidth, height: element.clientHeight }
      setSize(box)
      if (!placed.current && box.width > 0) {
        placed.current = true
        setView(fitted(box, UPRIGHT))
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [fitted])

  const zoomAt = useCallback(
    (point: { x: number; y: number }, factor: number) => {
      const old = live.current
      const min = fitted(size, UPRIGHT).scale * MIN_OF_FIT
      const scale = Math.min(Math.max(old.scale * factor, min), MAX_SCALE)
      const ratio = scale / old.scale
      moveTo({
        ...old,
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
    // The hand holds the canvas for as long as it is dragged. The stage's own
    // element sets a cursor over art, so it is set too, and both are put back.
    const held = [container.current, stage.current?.container()].filter((element) => element != null)
    const before = held.map((element) => element.style.cursor)
    held.forEach((element) => (element.style.cursor = "grabbing"))
    const move = (next: PointerEvent) => {
      const dx = next.clientX - last.x
      const dy = next.clientY - last.y
      last = { x: next.clientX, y: next.clientY }
      moveTo({ ...live.current, x: live.current.x + dx, y: live.current.y + dy })
    }
    const end = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      held.forEach((element, index) => (element.style.cursor = before[index]))
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
  }, [moveTo, stage])

  // The middle of what can be seen, on the screen.
  const seenMiddle = useMemo(
    () => ({ x: inset + (size.width - inset) / 2, y: size.height / 2 }),
    [inset, size]
  )

  // How far in and out the zoom goes.
  const limits = useMemo(() => ({ min: fitted(size, UPRIGHT).scale * MIN_OF_FIT, max: MAX_SCALE }), [fitted, size])

  const subscribe = useCallback((watcher: (view: BuilderView) => void) => {
    watchers.current.add(watcher)
    return () => {
      watchers.current.delete(watcher)
    }
  }, [])

  // Moves the view to have a point of the canvas in the middle of what can be seen.
  const centreOn = useCallback(
    (point: { x: number; y: number }) => moveTo(holdingAt(live.current, point, seenMiddle)),
    [moveTo, seenMiddle]
  )

  // The stage is being dragged by the hand tool: the view follows it, unsaid.
  const follow = useCallback((x: number, y: number) => {
    live.current = { ...live.current, x, y }
    watchers.current.forEach((watcher) => watcher(live.current))
  }, [])

  const liveView = useCallback(() => live.current, [])

  // The middle of what is in view, on the canvas.
  const centre = useCallback(
    () =>
      // Before the view is measured, the middle of the canvas.
      size.width === 0
        ? { x: canvas.width / 2, y: canvas.height / 2 }
        : toCanvas(live.current, seenMiddle),
    [size, seenMiddle, canvas.width, canvas.height]
  )

  // Turning and mirroring are of the view alone, about the middle of what is seen.
  const rotateTo = useCallback((degrees: number) => moveTo(turnedTo(live.current, degrees, seenMiddle)), [moveTo, seenMiddle])
  const rotateBy = useCallback((degrees: number) => rotateTo(live.current.rotation + degrees), [rotateTo])
  const onRotateDrag = useRotateDrag({ container, live, moveTo, about: seenMiddle })
  const flip = useCallback((axis: "h" | "v") => moveTo(flipped(live.current, axis, seenMiddle)), [moveTo, seenMiddle])
  const resetTurn = useCallback(
    () => moveTo(holdingAt({ ...live.current, ...UPRIGHT }, toCanvas(live.current, seenMiddle), seenMiddle)),
    [moveTo, seenMiddle]
  )

  return {
    container,
    centre,
    centreOn,
    follow,
    subscribe,
    limits,
    inset,
    liveView,
    onMiddlePan,
    onRotateDrag,
    size,
    view,
    rotateTo,
    rotateLeft: () => rotateBy(-TURN_STEP),
    rotateRight: () => rotateBy(TURN_STEP),
    flip,
    resetTurn,
    fit: () => setView(fitted(size, live.current)),
    zoomBy: (factor: number) => zoomAt(seenMiddle, factor),
    // To a zoom of the canvas's own pixels to screen pixels: 1 is 100%.
    zoomTo: (scale: number) => zoomAt(seenMiddle, scale / live.current.scale),
    onWheel,
    onPan: (x: number, y: number) => setView((old) => ({ ...old, x, y })),
  }
}
