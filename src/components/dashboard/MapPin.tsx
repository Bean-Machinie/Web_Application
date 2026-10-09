import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string | null
  Icon: LucideIcon
  // The kind's colour, used only for the dot and the small badge.
  tint: string
  name: string
  // A marker that opens another map gets a rounded square instead of a circle.
  isMap: boolean
  revealed: boolean
  // True for a marker that was just placed: it drops in with a small pop.
  pop: boolean
  // True while a GM is moving markers: outlined, with a ring to land in.
  editing: boolean
}

// Lifting is quick; letting go takes longer and overshoots, so the pin sinks a
// touch into the map and rebounds. These must stay whole strings for Tailwind.
const DROP = "duration-[520ms] ease-[cubic-bezier(0.3,2.1,0.5,1)]"
// Hovering is a lighter touch than being picked up: a shorter, gentler drop.
const DROP_SOFT = "duration-[400ms] ease-[cubic-bezier(0.34,1.6,0.5,1)]"
const PLANT = "group-[.pin-planted]/pin:motion-safe:animate-[pin-plant_520ms_ease-out]"
const SETTLE = "group-[.pin-planted]/pin:motion-safe:animate-[pin-settle_400ms_ease-out]"
// Hovered, or its card open (the layer adds "pin-selected"): straight up.
const HOVER_LIFT =
  "motion-safe:group-hover/pin:-translate-y-1 motion-safe:group-hover/pin:scale-[1.06] motion-safe:group-hover/pin:duration-150 motion-safe:group-hover/pin:ease-out"
const SELECTED_LIFT =
  "motion-safe:group-[.pin-selected]/pin:-translate-y-1 motion-safe:group-[.pin-selected]/pin:scale-[1.06] motion-safe:group-[.pin-selected]/pin:duration-150 motion-safe:group-[.pin-selected]/pin:ease-out"
// While editing: a nudge on hover, then pulled well clear of the map when
// pressed or being dragged.
const PICKUP =
  "motion-safe:group-hover/pin:-translate-y-0.5 motion-safe:group-active/pin:-translate-y-4 motion-safe:group-active/pin:scale-[1.2] motion-safe:group-active/pin:duration-150 motion-safe:group-active/pin:ease-out motion-safe:group-[.leaflet-drag-target]/pin:-translate-y-4 motion-safe:group-[.leaflet-drag-target]/pin:scale-[1.2] motion-safe:group-[.leaflet-drag-target]/pin:duration-150 motion-safe:group-[.leaflet-drag-target]/pin:ease-out"
// The map sets "map-zoom-far" or "map-zoom-near" on itself (see
// use-map-zoom-level); far shows dots instead of pins, near adds the name.
const FAR = "[.map-zoom-far_&]"
const NEAR = "[.map-zoom-near_&]"

// A marker on the map: the entry's picture in a round (or, for a map, rounded
// square) frame with a thin light rim and a soft shadow, on a small tail whose
// tip is the marker's position (the bottom centre of the 40 x 46 icon). A tiny
// badge on the lower corner shows the kind. Zoomed far out it shrinks to a dot
// in the kind's colour; zoomed in close its name appears beneath it, haloed so
// it reads on any terrain. Hovering lifts it straight up; leaving drops it back
// with a bounce. While a GM edits, a dashed ring marks the spot it is planted
// in, and pressing the pin pulls it up out of the map with the ring staying
// behind. Hidden entries are dimmed with a dashed frame, so a GM can tell what
// players cannot see. Rendered to static markup for Leaflet, whose icon element
// carries the "group/pin" class, and gets "pin-selected" and "pin-planted" from
// the layer. Motion is off for people who ask for reduced motion.
export function MapPin({ imageUrl, Icon, tint, name, isMap, revealed, pop, editing }: Props) {
  const color = revealed ? tint : undefined

  return (
    <div
      className={cn(
        "relative flex size-full origin-bottom flex-col items-center",
        pop &&
          "motion-safe:animate-[pin-pop_450ms_both] motion-safe:[animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
      )}
    >
      {/* The spot on the map: a soft shadow, or while editing a ring that
          shows where the pin will land. It stays put when the pin lifts. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full transition-[transform,opacity,border-color] duration-300",
          editing
            ? "border-foreground/50 bg-background/50 size-3 border border-dashed group-active/pin:scale-150 group-active/pin:border-foreground group-[.leaflet-drag-target]/pin:scale-150 group-[.leaflet-drag-target]/pin:border-foreground"
            : `h-1.5 w-4 bg-black/25 blur-[2px] ${FAR}:opacity-0`
        )}
      />
      {/* The dot the pin becomes when zoomed far out. */}
      {!editing && (
        <div
          aria-hidden
          style={{ backgroundColor: color }}
          className={cn(
            "pointer-events-none absolute bottom-0 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 scale-50 border-[1.5px] border-white opacity-0 shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-[opacity,scale] duration-300",
            isMap ? "rounded-[4px]" : "rounded-full",
            !revealed && "bg-neutral-400 opacity-0",
            `${FAR}:scale-100 ${FAR}:opacity-100`,
            !revealed && `${FAR}:opacity-60`
          )}
        />
      )}
      {/* The ring that points a marker out on coming back to the map. */}
      <div
        aria-hidden
        style={{ borderColor: color }}
        className="pointer-events-none absolute top-0 left-1/2 size-10 -translate-x-1/2 rounded-full border-2 opacity-0 group-[.pin-find]/pin:motion-safe:animate-[pin-find_1.3s_ease-out_2]"
      />
      {/* The ripple a pin sends out across the map when it is put down. */}
      {editing && (
        <div
          aria-hidden
          style={{ borderColor: color }}
          className="pointer-events-none absolute bottom-0 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 opacity-0 group-[.pin-planted]/pin:motion-safe:animate-[pin-ripple_550ms_ease-out]"
        />
      )}
      {/* Separate from the lift below, which owns translate and scale. */}
      <div
        className={cn(
          "relative h-[46px] w-10 origin-bottom transition-[opacity,scale] duration-300",
          `${FAR}:pointer-events-none ${FAR}:scale-50 ${FAR}:opacity-0`
        )}
      >
        <div
          className={cn(
            "relative h-[46px] w-10 origin-bottom drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-transform",
            !revealed && "opacity-65",
            editing ? [DROP, PICKUP, PLANT] : [DROP_SOFT, HOVER_LIFT, SELECTED_LIFT, SETTLE]
          )}
        >
          {/* Behind the frame, so only the point shows below it. */}
          <div
            className={cn(
              "absolute bottom-0 left-1/2 h-[9px] w-3.5 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]",
              revealed ? "bg-white" : "bg-neutral-300"
            )}
          />
          <div
            className={cn(
              "bg-card text-foreground relative flex size-10 items-center justify-center overflow-hidden border-2 ring-1 ring-black/10",
              isMap ? "rounded-[13px]" : "rounded-full",
              revealed ? "border-white" : "border-dashed border-neutral-500",
              editing && "outline-foreground/30 outline-1 outline-offset-2",
              "group-focus-visible/pin:ring-ring group-focus-visible/pin:ring-2"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className={cn("size-full object-cover", !revealed && "grayscale")}
              />
            ) : (
              <Icon className="size-5" />
            )}
          </div>
          <div
            aria-hidden
            style={{ backgroundColor: color }}
            className={cn(
              "absolute right-[-3px] bottom-[3px] flex size-4 items-center justify-center rounded-full border-[1.5px] border-white text-white",
              !revealed && "bg-neutral-500"
            )}
          >
            <Icon className="size-2.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      {!editing && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-full left-1/2 mt-1.5 max-w-40 -translate-x-1/2 truncate text-xs font-semibold tracking-wide whitespace-nowrap text-neutral-900 opacity-0 transition-opacity duration-300 [paint-order:stroke_fill] [-webkit-text-stroke:3.5px_rgba(255,255,255,0.85)] [text-shadow:0_0_6px_rgba(255,255,255,0.9)]",
            `${NEAR}:opacity-100`
          )}
        >
          {name}
        </span>
      )}
    </div>
  )
}
