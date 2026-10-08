import type { LucideIcon } from "lucide-react"

type Props = {
  imageUrl: string | null
  Icon: LucideIcon
  // The ring colour of the marker's kind.
  tint: string
  revealed: boolean
  selected: boolean
  // True for a marker that was just placed: it drops in with a small pop.
  pop: boolean
}

// A marker on the map: the entry's picture (or its kind's icon) in a round
// badge ringed in the kind's colour, with a small tail. Hover does not move
// it: MapMarkerCard takes its place and grows out of it, so the pin must look
// the same as that card's starting shape. Hidden entries are dashed and grey,
// so a GM can tell what players cannot see. Rendered to static markup for
// Leaflet. Motion is off for people who ask for reduced motion.
export function MapPin({ imageUrl, Icon, tint, revealed, selected, pop }: Props) {
  const color = revealed ? tint : undefined

  return (
    <div
      className={`flex size-full origin-bottom flex-col items-center ${
        pop ? `motion-safe:animate-[pin-pop_450ms_both] motion-safe:[animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)]` : ""
      }`}
    >
      <div className="flex origin-bottom flex-col items-center">
        <div
          style={{ borderColor: color }}
          className={`bg-card text-foreground flex size-10 items-center justify-center overflow-hidden rounded-full border-2 shadow-md ${
            revealed ? "" : "border-muted-foreground border-dashed opacity-80"
          } ${selected ? "ring-primary ring-offset-background ring-2 ring-offset-2" : ""}`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className={`size-full object-cover ${revealed ? "" : "grayscale"}`}
            />
          ) : (
            <Icon className="size-5" />
          )}
        </div>
        <div
          style={{ backgroundColor: color }}
          className={`-mt-1.5 size-3 rotate-45 ${revealed ? "" : "bg-muted-foreground"}`}
        />
      </div>
    </div>
  )
}
