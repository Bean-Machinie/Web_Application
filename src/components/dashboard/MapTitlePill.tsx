import { EyeOff } from "lucide-react"
import { MAP_FLOAT_ROW } from "./map-float"

// The map's name is not shown over it; only a map hidden from players says so, as
// a quiet chip at the top left.
export function MapTitlePill({ revealed }: { revealed: boolean }) {
  if (revealed) return null
  return (
    <div
      className={`${MAP_FLOAT_ROW} text-muted-foreground pointer-events-none absolute top-4 left-4 z-[1000] flex items-center gap-1.5 px-3 text-xs font-medium`}
    >
      <EyeOff className="size-3.5" />
      Hidden
    </div>
  )
}
