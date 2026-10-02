import { Lock } from "lucide-react"

export function Undisclosed() {
  return (
    <span className="bg-muted text-muted-foreground flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
      <Lock className="size-3" />
      Undisclosed
    </span>
  )
}
