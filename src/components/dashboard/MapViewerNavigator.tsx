import { useEffect, useRef, useState } from "react"
import * as L from "leaflet"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { useMapCamera } from "@/hooks/use-map-camera"
import type { MapSize } from "@/lib/map-geometry"
import { glideZoomBy } from "@/lib/map-glide"
import { MapCardButton } from "./MapCardButton"
import { MapViewerZoomRow } from "./MapViewerZoomRow"
import { MAP_FLOAT } from "./map-float"

type Props = { map: L.Map | null; url: string; size: MapSize; onDetails: () => void }

// The zoom of one step of the wheel, as for the map itself.
const WHEEL_RATE = 0.005

// A small picture of the whole map in the top right corner, with a red rectangle on
// what can be seen. Drag the rectangle to pan, press anywhere else to jump there and
// carry on dragging, and scroll over it to zoom, as in the builder's navigator.
export function MapViewerNavigator({ map, url, size, onDetails }: Props) {
  const camera = useMapCamera(map)
  const [open, setOpen] = useState(true)
  const frame = useRef<HTMLDivElement>(null)
  // Where the pointer holds the view, from its middle, while it is dragged.
  const holding = useRef<{ x: number; y: number } | null>(null)

  // Not passive, so that scrolling here zooms and does not scroll the page.
  useEffect(() => {
    const element = frame.current
    if (!element || !map) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      glideZoomBy(map, -event.deltaY * WHEEL_RATE)
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    return () => element.removeEventListener("wheel", onWheel)
  }, [map])

  if (!map || !camera) return null

  // What can be seen, in the image's own pixels (y down from the top).
  const scale = 2 ** camera.zoom
  const half = map.getSize().divideBy(2 * scale)
  const middle = { x: camera.center.lng, y: size.height - camera.center.lat }
  const left = Math.max(0, middle.x - half.x)
  const right = Math.min(size.width, middle.x + half.x)
  const top = Math.max(0, middle.y - half.y)
  const bottom = Math.min(size.height, middle.y + half.y)
  const hidden = right <= left || bottom <= top

  const pointOf = (event: React.PointerEvent) => {
    const rect = frame.current!.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * size.width,
      y: ((event.clientY - rect.top) / rect.height) * size.height,
    }
  }
  const centreOn = (point: { x: number; y: number }) =>
    map.setView(L.latLng(size.height - point.y, point.x), map.getZoom(), { animate: false })

  function onPointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const at = pointOf(event)
    const inside = at.x >= middle.x - half.x && at.x <= middle.x + half.x && at.y >= middle.y - half.y && at.y <= middle.y + half.y
    // On the rectangle it is held where it was taken; off it, it jumps to the point.
    holding.current = inside ? { x: at.x - middle.x, y: at.y - middle.y } : { x: 0, y: 0 }
    if (!inside) centreOn(at)
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!holding.current) return
    const at = pointOf(event)
    centreOn({ x: at.x - holding.current.x, y: at.y - holding.current.y })
  }

  return (
    <div
      className={`${MAP_FLOAT} absolute top-4 right-4 z-[1000] overflow-hidden transition-[width] duration-200 ease-linear motion-reduce:transition-none ${open ? "w-56 sm:w-64" : "w-16"}`}
    >
      {/* The builder's header bar. Put away, only its two buttons are left. */}
      <div className="bg-muted/50 flex h-8 items-stretch">
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block truncate px-3 text-xs leading-8 font-medium">Navigator</span>
        </span>
        <MapCardButton label={open ? "Collapse the navigator" : "Expand the navigator"} onClick={() => setOpen(!open)}>
          {open ? <ChevronUp /> : <ChevronDown />}
        </MapCardButton>
        <MapCardButton label="Details" onClick={onDetails}>
          <MoreHorizontal />
        </MapCardButton>
      </div>
      {/* Slides shut by the height of its row going to nothing. */}
      <div
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-linear motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
      <div className="min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2 border-t p-3">
      <div
        ref={frame}
        role="presentation"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (holding.current = null)}
        onPointerCancel={() => (holding.current = null)}
        style={{ aspectRatio: `${size.width} / ${size.height}` }}
        className="bg-muted relative cursor-crosshair touch-none overflow-hidden rounded-md border"
      >
        <img src={url} alt="" draggable={false} className="size-full object-fill select-none" />
        {!hidden && (
          <div
            className="pointer-events-none absolute border-2 border-red-500 bg-red-500/10"
            style={{
              left: `${(left / size.width) * 100}%`,
              top: `${(top / size.height) * 100}%`,
              width: `${((right - left) / size.width) * 100}%`,
              height: `${((bottom - top) / size.height) * 100}%`,
            }}
          />
        )}
      </div>
      <MapViewerZoomRow map={map} />
      </div>
      </div>
      </div>
    </div>
  )
}
