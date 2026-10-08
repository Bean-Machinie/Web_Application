import { Hand } from "lucide-react"

// Shown while a GM edits markers: an outline round the map, so the mode is
// plain at a glance, and a line saying what can be done.
export function MapEditHint() {
  return (
    <>
      <div className="ring-primary/50 animate-in fade-in-0 pointer-events-none absolute inset-0 z-[999] rounded-lg ring-2 ring-inset duration-200" />
      <div className="bg-background/90 text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 pointer-events-none absolute bottom-3 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap shadow-sm backdrop-blur-sm duration-200">
        <Hand className="size-3.5" />
        Drag a pin to move it · click for options
      </div>
    </>
  )
}
