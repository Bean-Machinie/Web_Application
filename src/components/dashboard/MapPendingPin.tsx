import { Plus } from "lucide-react"

// Where a new marker will go while it is being linked to an entry.
export function MapPendingPin() {
  return (
    <div className="flex size-full flex-col items-center">
      <div className="bg-background/80 text-foreground border-foreground/60 flex size-10 animate-pulse items-center justify-center rounded-full border-2 border-dashed backdrop-blur-sm">
        <Plus className="size-5" />
      </div>
    </div>
  )
}
