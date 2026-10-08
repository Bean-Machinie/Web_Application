import type { LucideIcon } from "lucide-react"

type Props = {
  imageUrl: string | null
  Icon: LucideIcon
  revealed: boolean
  selected: boolean
}

// A marker on the map: the entry's picture (or its kind's icon) in a round
// badge with a small tail. Hidden entries are dashed and grey, so a GM can
// tell what players cannot see. Rendered to static markup for Leaflet.
export function MapPin({ imageUrl, Icon, revealed, selected }: Props) {
  return (
    <div className="flex size-full flex-col items-center">
      <div
        className={`bg-card text-foreground flex size-10 items-center justify-center overflow-hidden rounded-full border-2 shadow-md transition-transform ${
          revealed ? "border-white" : "border-muted-foreground border-dashed opacity-80"
        } ${selected ? "ring-primary ring-offset-background scale-110 ring-2 ring-offset-2" : ""}`}
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
        className={`-mt-1.5 size-3 rotate-45 shadow-sm ${revealed ? "bg-white" : "bg-muted-foreground"}`}
      />
    </div>
  )
}
