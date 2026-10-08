import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string | null
  Icon: LucideIcon
  // The ring colour of the marker's kind.
  tint: string
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

// A marker on the map: the entry's picture (or its kind's icon) in a round
// badge ringed in the kind's colour, on a small tail whose tip is the marker's
// position (the bottom centre of the 40 x 46 icon). Hovering lifts it straight
// up; leaving drops it back with a bounce. While a
// GM edits, a dashed ring marks the spot it is planted in, and pressing the pin
// pulls it up out of the map with the ring staying behind, and putting it
// down sends a ripple across the map. Hidden entries are
// dashed and grey, so a GM can tell what players cannot see. Rendered to
// static markup for Leaflet, whose icon element carries the "group/pin" class,
// and gets "pin-selected" and "pin-planted" from the layer. Motion is off for
// people who ask for reduced motion.
export function MapPin({ imageUrl, Icon, tint, revealed, pop, editing }: Props) {
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
          "pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full transition-[transform,opacity,border-color] duration-200",
          editing
            ? "border-foreground/50 bg-background/50 size-3 border border-dashed group-active/pin:scale-150 group-active/pin:border-foreground group-[.leaflet-drag-target]/pin:scale-150 group-[.leaflet-drag-target]/pin:border-foreground"
            : "h-1.5 w-4 bg-black/25 blur-[2px]"
        )}
      />
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
      <div
        className={cn(
          "relative h-[46px] w-10 origin-bottom transition-transform",
          editing ? [DROP, PICKUP, PLANT] : [DROP_SOFT, HOVER_LIFT, SELECTED_LIFT, SETTLE]
        )}
      >
        {/* Behind the circle, so only the point shows below it. */}
        <div
          style={{ backgroundColor: color }}
          className={cn(
            "absolute bottom-0 left-1/2 h-[9px] w-3.5 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]",
            !revealed && "bg-muted-foreground"
          )}
        />
        <div
          style={{ borderColor: color }}
          className={cn(
            "bg-card text-foreground relative flex size-10 items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition-shadow duration-150",
            editing
              ? "outline-foreground/30 outline-1 outline-offset-2 group-active/pin:shadow-xl group-[.leaflet-drag-target]/pin:shadow-xl"
              : "group-hover/pin:shadow-xl group-[.pin-selected]/pin:shadow-xl",
            !revealed && "border-muted-foreground border-dashed opacity-80",
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
      </div>
    </div>
  )
}
