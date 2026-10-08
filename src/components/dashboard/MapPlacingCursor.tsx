import { useEffect, useRef } from "react"
import type * as L from "leaflet"
import { MapPendingPin } from "./MapPendingPin"

// The pin is 40 x 46 with its tip at the bottom centre.
const PIN_W = 40
const PIN_H = 46

// While choosing where a marker goes, a pin follows the pointer with its tip
// exactly on it, and a ring on the map marks the spot. It replaces the system
// cursor, which says nothing about where the tip will land. Placed by hand on
// every move, so it never waits on a render. Touch has no pointer to follow.
export function MapPlacingCursor({ map }: { map: L.Map }) {
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = map.getContainer()
    const show = (event: PointerEvent) => {
      const pin = element.current
      if (!pin || event.pointerType === "touch") return
      const { left, top } = container.getBoundingClientRect()
      pin.style.transform = `translate(${event.clientX - left - PIN_W / 2}px, ${event.clientY - top - PIN_H}px)`
      pin.style.opacity = "1"
    }
    const hide = () => {
      if (element.current) element.current.style.opacity = "0"
    }
    container.addEventListener("pointermove", show)
    container.addEventListener("pointerleave", hide)
    return () => {
      container.removeEventListener("pointermove", show)
      container.removeEventListener("pointerleave", hide)
    }
  }, [map])

  return (
    <div
      ref={element}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-[1000] opacity-0 transition-opacity duration-150"
      style={{ width: PIN_W, height: PIN_H }}
    >
      <div className="border-foreground/60 bg-background/50 absolute bottom-0 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full border border-dashed" />
      <MapPendingPin />
    </div>
  )
}
