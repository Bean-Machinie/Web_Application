import { Hand } from "lucide-react"
import { MAP_FLOAT_ROW } from "./map-float"

// Shown while a GM edits markers: an outline round the map, so the mode is
// plain at a glance, and a line above the toolbar saying what can be done.
export function MapEditHint() {
  return (
    <>
      <div className="ring-primary/50 animate-in fade-in-0 pointer-events-none absolute inset-0 z-[999] ring-2 ring-inset duration-200" />
      <div className={`${MAP_FLOAT_ROW} text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 pointer-events-none absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 px-3 text-xs whitespace-nowrap duration-200`}>
        <Hand className="size-3.5" />
        Drag a pin to move it · click for options
      </div>
    </>
  )
}
