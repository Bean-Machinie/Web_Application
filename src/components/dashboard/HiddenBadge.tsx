import { EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

// Marks what players cannot see, as an icon alone. Only GMs ever see hidden entries, so it
// needs no check. The shadow keeps it readable when it sits over a picture.
export function HiddenBadge({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Hidden from players"
      title="Hidden from players"
      className={cn("inline-flex drop-shadow-sm", className)}
    >
      <EyeOff className="size-4" />
    </span>
  )
}
