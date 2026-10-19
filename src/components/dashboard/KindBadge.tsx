import { Badge } from "@/components/ui/badge"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

// The kind as an outlined badge, for the Type column of the list.
export function KindBadge({ kind }: { kind: WorldEntryKind }) {
  const { label, icon: Icon } = WORLD_KINDS[kind]

  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Icon />
      {label}
    </Badge>
  )
}
