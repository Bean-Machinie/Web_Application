import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string | null
  Icon: LucideIcon
  // The ring colour of the marker's kind.
  tint: string
  revealed: boolean
  // True while its card is open: the pin stays lifted under the card.
  selected: boolean
  // True for a marker that was just placed: it drops in with a small pop.
  pop: boolean
  // True while a GM is moving markers: outlined and not lifted by hover.
  editing: boolean
}

// Overshoots, so a pin let go of sinks a touch into the map before it settles.
const SPRING = "ease-[cubic-bezier(0.34,1.56,0.64,1)]"
// Pressed or being dragged: up and out of the map, quickly.
const PICKUP = [
  "motion-safe:group-hover/pin:-translate-y-0.5",
  "motion-safe:group-active/pin:-translate-y-3 motion-safe:group-active/pin:scale-[1.15] motion-safe:group-active/pin:duration-150 motion-safe:group-active/pin:ease-out",
  "motion-safe:group-[.leaflet-drag-target]/pin:-translate-y-3 motion-safe:group-[.leaflet-drag-target]/pin:scale-[1.15] motion-safe:group-[.leaflet-drag-target]/pin:duration-150 motion-safe:group-[.leaflet-drag-target]/pin:ease-out",
].join(" ")

// A marker on the map: the entry's picture (or its kind's icon) in a round
// badge ringed in the kind's colour, on a small tail whose tip is the marker's
// position (the bottom centre of the 40 x 46 icon). On hover it lifts and grows
// with a little bounce. While a GM edits, a dashed ring marks the spot it is
// planted in; pressing the pin picks it up off the map, with the ring staying
// behind, and letting go plants it back with a bounce. Hidden entries are dashed and grey, so a GM can tell
// what players cannot see. Rendered to static markup for Leaflet, whose icon
// element carries the "group/pin" class. Motion is off for people who ask for
// reduced motion.
export function MapPin({ imageUrl, Icon, tint, revealed, selected, pop, editing }: Props) {
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
      <div
        className={cn(
          "relative h-[46px] w-10 origin-bottom transition-transform duration-[380ms]",
          SPRING,
          !editing &&
            "motion-safe:group-hover/pin:-translate-y-1.5 motion-safe:group-hover/pin:scale-110",
          !editing && selected && "motion-safe:-translate-y-1.5 motion-safe:scale-110",
          editing && PICKUP,
          "group-[.pin-planted]/pin:motion-safe:animate-[pin-plant_320ms_ease-out]"
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
            editing && "group-active/pin:shadow-xl group-[.leaflet-drag-target]/pin:shadow-xl",
            !revealed && "border-muted-foreground border-dashed opacity-80",
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
      </div>
    </div>
  )
}
