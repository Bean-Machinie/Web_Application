import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// A marker that is not placed yet: a dashed circle with a plus on a small
// tail, in the same 40 x 46 box and shape as a real pin. It is the cursor
// while choosing the spot, and then stays where the marker will go while it is
// linked to an entry. With `drop` it arrives from where the cursor held it:
// falling into the map, squashing and rebounding, with a ripple from the spot.
export function MapPendingPin({ drop = false }: { drop?: boolean }) {
  return (
    <div className="relative flex size-full flex-col items-center">
      {drop && (
        <div className="border-foreground/50 pointer-events-none absolute bottom-0 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 opacity-0 motion-safe:animate-[pin-ripple_550ms_ease-out_120ms]" />
      )}
      <div
        className={cn(
          "relative flex size-full origin-bottom flex-col items-center",
          drop && "motion-safe:animate-[pin-drop_520ms_ease-out]"
        )}
      >
        <div className="bg-foreground/60 absolute bottom-0 left-1/2 h-[9px] w-3.5 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <div className="bg-background/80 text-foreground border-foreground/60 relative flex size-10 animate-pulse items-center justify-center rounded-full border-2 border-dashed backdrop-blur-sm">
          <Plus className="size-5" />
        </div>
      </div>
    </div>
  )
}
