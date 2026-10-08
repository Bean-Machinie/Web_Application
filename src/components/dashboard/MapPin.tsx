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

const SPRING = "ease-[cubic-bezier(0.34,1.56,0.64,1)]"

// A marker on the map: the entry's picture (or its kind's icon) in a round
// badge ringed in the kind's colour, on a small tail whose tip is the marker's
// position (the bottom centre of the 40 x 46 icon). On hover it lifts and grows
// with a little bounce. Hidden entries are dashed and grey, so a GM can tell
// what players cannot see. Rendered to static markup for Leaflet, whose icon
// element carries the "group/pin" class. Motion is off for people who ask for
// reduced motion.
export function MapPin({ imageUrl, Icon, tint, revealed, selected, pop, editing }: Props) {
  const color = revealed ? tint : undefined

  return (
    <div
      className={cn(
        "flex size-full origin-bottom flex-col items-center",
        pop &&
          "motion-safe:animate-[pin-pop_450ms_both] motion-safe:[animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
      )}
    >
      <div
        className={cn(
          "relative h-[46px] w-10 origin-bottom transition-transform duration-300",
          SPRING,
          !editing &&
            "motion-safe:group-hover/pin:-translate-y-1.5 motion-safe:group-hover/pin:scale-110",
          !editing && selected && "motion-safe:-translate-y-1.5 motion-safe:scale-110"
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
            "bg-card text-foreground relative flex size-10 items-center justify-center overflow-hidden rounded-full border-2 shadow-md",
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
