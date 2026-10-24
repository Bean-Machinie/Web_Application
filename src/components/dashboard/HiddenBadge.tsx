import { HoverIcon } from "@/components/icons/HoverIcon"
import { EyeOffIcon } from "@/components/icons/EyeOffIcon"
import { Badge } from "@/components/ui/badge"

// The loudest badge we have, on purpose: a GM must see at a glance what
// players cannot. Only GMs ever see hidden entries, so it needs no check.
export function HiddenBadge({ className }: { className?: string }) {
  return (
    <Badge className={className}>
      <HoverIcon icon={EyeOffIcon} size={12} />
      Hidden
    </Badge>
  )
}
