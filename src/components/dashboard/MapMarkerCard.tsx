import { useEffect, useMemo, useRef, useState } from "react"
import type * as L from "leaflet"
import { motion, useReducedMotion } from "motion/react"
import type { BackTo } from "@/lib/back-link"
import { toLatLng } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"
import { CARD_WIDTH, PIN_CIRCLE, PIN_HEIGHT, PIN_LIFT, SPRING, pinPoint, placeCard } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { MapMarkerCardBody } from "./MapMarkerCardBody"
import { MapMarkerPortrait } from "./MapMarkerPortrait"

type Props = {
  marker: MapMarker
  map: L.Map
  size: MapSize
  canManage: boolean
  backTo: BackTo
  // False while the card folds back into its pin.
  open: boolean
  // True once the marker is clicked: the card then has its buttons.
  pinned: boolean
  onEnter: () => void
  onLeave: () => void
  onSelect: () => void
  // A press that should become a drag of the pin underneath.
  onGrab: (clientX: number, clientY: number) => void
  onClose: () => void
  onRemove: () => void
  // The card has folded into its pin and can go.
  onDone: () => void
}

// The card of a marker. It starts as the pin itself, drawn exactly over it,
// then grows out of the pin's tip into the card and folds back on leaving.
// People who ask for reduced motion get a plain fade instead.
export function MapMarkerCard({ marker, map, size, canManage, backTo, open, pinned, ...on }: Props) {
  const reduced = useReducedMotion()
  const { tint, icon } = WORLD_KINDS[marker.kind]
  const position = useMemo(() => toLatLng(marker, size), [marker, size])
  // Fixed while the card is up, so panning never makes it reshape.
  const [spot] = useState(() => {
    const point = pinPoint(map, position)
    return { point, ...placeCard(point, map.getSize()) }
  })
  const anchor = useRef<HTMLDivElement>(null)
  const [grown, setGrown] = useState(false)
  const card = reduced || grown
  const color = marker.revealed ? tint : undefined

  // Follows the pin by hand so the card is not re-laid out while it moves.
  useEffect(() => {
    const follow = () => {
      const { x, y } = pinPoint(map, position)
      anchor.current?.style.setProperty("left", `${x}px`)
      anchor.current?.style.setProperty("top", `${y}px`)
    }
    map.on("move zoom resize", follow)
    return () => {
      map.off("move zoom resize", follow)
    }
  }, [map, position])

  // Two frames at rest first, so the pin's handoff is seen before it grows.
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setGrown(open))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [open])

  const { onDone } = on
  useEffect(() => {
    if (open) return
    const timer = setTimeout(onDone, reduced ? 180 : 320)
    return () => clearTimeout(timer)
  }, [open, reduced, onDone])

  const box = card
    ? spot.below
      ? { left: spot.left, top: -PIN_HEIGHT }
      : { left: spot.left, bottom: PIN_LIFT }
    : { left: -PIN_CIRCLE / 2, top: -PIN_HEIGHT }

  return (
    <div
      ref={anchor}
      className="absolute z-[1000] size-0"
      style={{ left: spot.point.x, top: spot.point.y }}
    >
      <motion.div
        layout={!reduced}
        initial={reduced ? { opacity: 0 } : false}
        animate={reduced ? { opacity: open ? 1 : 0 } : undefined}
        transition={{ layout: SPRING, duration: 0.15 }}
        onPointerEnter={on.onEnter}
        onPointerLeave={on.onLeave}
        onPointerDown={(event) => {
          if (canManage && !pinned && event.pointerType === "mouse" && event.button === 0) {
            on.onGrab(event.clientX, event.clientY)
          }
        }}
        onClick={() => {
          if (!pinned) on.onSelect()
        }}
        style={{
          ...box,
          width: card ? CARD_WIDTH : PIN_CIRCLE,
          height: card ? "auto" : PIN_CIRCLE,
          borderRadius: card ? 8 : PIN_CIRCLE / 2,
        }}
        className={cn(
          "bg-card absolute overflow-hidden text-sm",
          !pinned && "cursor-pointer",
          card ? "text-card-foreground ring-foreground/10 shadow-lg ring-1" : "text-foreground shadow-md",
          !card && pinned && "ring-primary ring-offset-background ring-2 ring-offset-2",
          !card && !marker.revealed && "opacity-80"
        )}
      >
        <MapMarkerCardBody
          marker={marker}
          canManage={canManage}
          backTo={backTo}
          pinned={pinned}
          shown={card}
          onClose={on.onClose}
          onRemove={on.onRemove}
        />
        <MapMarkerPortrait
          id={marker.id}
          imageUrl={marker.imageUrl}
          Icon={icon}
          revealed={marker.revealed}
          card={card}
        />
        {/* The kind's ring, drawn over the pin's picture as the pin does. */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: card ? 0 : 1 }}
          transition={{ duration: 0.12, delay: card ? 0 : 0.13 }}
          style={{ borderColor: color }}
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border-2",
            !marker.revealed && "border-muted-foreground border-dashed"
          )}
        />
      </motion.div>
      {/* The strip of the pin's footprint under its circle, so leaving through
          the tail does not strand the card open. */}
      <div
        className="absolute"
        style={{ left: -PIN_CIRCLE / 2, top: -PIN_LIFT, width: PIN_CIRCLE, height: PIN_LIFT }}
        onPointerEnter={on.onEnter}
        onPointerLeave={on.onLeave}
      />
      {!reduced && (
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: card ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          style={{ backgroundColor: color, left: -6, top: -PIN_LIFT * 2 }}
          className={cn(
            "pointer-events-none absolute size-3 rotate-45",
            !marker.revealed && "bg-muted-foreground"
          )}
        />
      )}
    </div>
  )
}
