import { Lock } from "lucide-react"

export function Undisclosed() {
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
      <Lock className="size-3.5" />
      Undisclosed
    </span>
  )
}
