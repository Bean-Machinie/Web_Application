import { EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// The loudest badge we have, on purpose: a GM must see at a glance what
// players cannot. Only GMs ever see hidden entries, so it needs no check.
export function HiddenBadge({ className }: { className?: string }) {
  return (
    <Badge className={className}>
      <EyeOff />
      Hidden
    </Badge>
  )
}
