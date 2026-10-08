import { Plus } from "lucide-react"

// A marker that is not placed yet: a dashed circle with a plus on a small
// tail, in the same 40 x 46 box and shape as a real pin. Shown where a new
// marker will go while it is linked to an entry, and as the cursor while
// choosing the spot.
export function MapPendingPin() {
  return (
    <div className="relative flex size-full flex-col items-center">
      <div className="bg-foreground/60 absolute bottom-0 left-1/2 h-[9px] w-3.5 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <div className="bg-background/80 text-foreground border-foreground/60 relative flex size-10 animate-pulse items-center justify-center rounded-full border-2 border-dashed backdrop-blur-sm">
        <Plus className="size-5" />
      </div>
    </div>
  )
}
