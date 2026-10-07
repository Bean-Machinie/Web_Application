import { useCallback, useEffect, useMemo, useRef } from "react"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { cornersOnCanvas, toCanvas, toScreen } from "@/lib/view-matrix"
import type { BuilderView } from "@/lib/view-matrix"
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
  const box = useRef<SVGPolygonElement>(null)
  // Where the pointer holds the view, from the middle of what is seen, while it is dragged.
  const holding = useRef<{ x: number; y: number } | null>(null)
  useMapOverview(picture, scene, terrain)

  const { size, inset, subscribe, liveView, centreOn, zoomBy } = viewport
  const middle = useMemo(() => ({ x: inset + (size.width - inset) / 2, y: size.height / 2 }), [inset, size])

  // The rectangle is of the screen, so on the map it is turned as the view is. It
  // is moved by its points, as the view moves, not by state.
  const place = useCallback(
    (view: BuilderView) => {
      const element = box.current
      if (!element || size.width === 0) return
      const corners = cornersOnCanvas(view, inset, 0, size.width, size.height)
      element.setAttribute("points", corners.map((corner) => `${corner.x},${corner.y}`).join(" "))
    },
    [inset, size]
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
    const view = liveView()
    const on = toScreen(view, at)
    const inside = on.x >= inset && on.x <= size.width && on.y >= 0 && on.y <= size.height
    // On the rectangle it is held where it was taken; off it, it jumps to the point.
    const centre = toCanvas(view, middle)
    holding.current = inside ? { x: at.x - centre.x, y: at.y - centre.y } : { x: 0, y: 0 }
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
      <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
        <polygon ref={box} className="fill-red-500/10 stroke-red-500" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
