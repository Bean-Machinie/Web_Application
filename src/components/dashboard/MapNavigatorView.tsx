import { useCallback, useEffect, useRef } from "react"
import type { BuilderView, useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useMapOverview } from "@/hooks/use-map-overview"
import { overviewSize } from "@/lib/map-overview"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"

type Props = {
  scene: MapScene
  terrain: Terrain | null
  viewport: ReturnType<typeof useBuilderViewport>
}

// The zoom of one step of the wheel, as for the canvas itself.
const WHEEL_RATE = 0.0015

// A small picture of the whole map with a rectangle on what can be seen of it (not
// what is under the tool panel). Drag the rectangle to pan, press anywhere else to
// jump there and carry on dragging, and scroll over it to zoom.
export function MapNavigatorView({ scene, terrain, viewport }: Props) {
  const { width: canvasWidth, height: canvasHeight } = scene.canvas
  const { width, height } = overviewSize(scene.canvas)
  const picture = useRef<HTMLCanvasElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  // Where the pointer holds the rectangle, from its middle, while it is dragged.
  const holding = useRef<{ x: number; y: number } | null>(null)
  useMapOverview(picture, scene, terrain)

  const { size, inset, subscribe, liveView, centreOn, zoomBy } = viewport

  // What can be seen, on the canvas, from a view.
  const seenBy = useCallback(
    (view: BuilderView) => ({
      left: (inset - view.x) / view.scale,
      right: (size.width - view.x) / view.scale,
      top: -view.y / view.scale,
      bottom: (size.height - view.y) / view.scale,
    }),
    [inset, size]
  )

  // The rectangle is moved by its style, as the view moves, not by state.
  const place = useCallback(
    (view: BuilderView) => {
      const element = box.current
      if (!element || size.width === 0) return
      const seen = seenBy(view)
      const left = Math.max(0, seen.left)
      const top = Math.max(0, seen.top)
      const right = Math.min(canvasWidth, seen.right)
      const bottom = Math.min(canvasHeight, seen.bottom)
      const hidden = right <= left || bottom <= top
      element.style.visibility = hidden ? "hidden" : "visible"
      element.style.left = `${(left / canvasWidth) * 100}%`
      element.style.top = `${(top / canvasHeight) * 100}%`
      element.style.width = `${(Math.max(0, right - left) / canvasWidth) * 100}%`
      element.style.height = `${(Math.max(0, bottom - top) / canvasHeight) * 100}%`
    },
    [seenBy, size.width, canvasWidth, canvasHeight]
  )

  useEffect(() => {
    place(liveView())
    return subscribe(place)
  }, [place, liveView, subscribe])

  // Not passive, so that scrolling here zooms and does not scroll the panel.
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : WHEEL_RATE)))
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    return () => element.removeEventListener("wheel", onWheel)
  }, [zoomBy])

  const pointOf = (event: React.PointerEvent) => {
    const rect = frame.current!.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvasWidth,
      y: ((event.clientY - rect.top) / rect.height) * canvasHeight,
    }
  }

  function onPointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const at = pointOf(event)
    const seen = seenBy(liveView())
    const inside = at.x >= seen.left && at.x <= seen.right && at.y >= seen.top && at.y <= seen.bottom
    // On the rectangle it is held where it was taken; off it, it jumps to the point.
    holding.current = inside
      ? { x: at.x - (seen.left + seen.right) / 2, y: at.y - (seen.top + seen.bottom) / 2 }
      : { x: 0, y: 0 }
    if (!inside) centreOn(at)
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!holding.current) return
    const at = pointOf(event)
    centreOn({ x: at.x - holding.current.x, y: at.y - holding.current.y })
  }

  return (
    <div
      ref={frame}
      role="presentation"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (holding.current = null)}
      onPointerCancel={() => (holding.current = null)}
      // As wide as the room allows, and no taller than it, in the map's own shape.
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        width: `min(100cqw, calc(100cqh * ${canvasWidth / canvasHeight}))`,
      }}
      className="bg-muted relative shrink-0 cursor-crosshair touch-none overflow-hidden rounded-md border"
    >
      <canvas ref={picture} width={width} height={height} className="size-full" />
      <div
        ref={box}
        className="border-primary bg-primary/10 absolute cursor-grab border-2 active:cursor-grabbing"
        style={{ visibility: "hidden" }}
      />
    </div>
  )
}
