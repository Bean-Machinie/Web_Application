import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = { kind: WorldEntryKind; className?: string }

// What kind of entry this is, wherever one is listed: the kind's icon and its
// name in quiet text, with no box round it.
export function KindLabel({ kind, className }: Props) {
  const { label, icon: Icon } = WORLD_KINDS[kind]

  return (
    <span
      className={cn(
        "text-muted-foreground flex w-fit items-center gap-1.5 text-xs font-medium",
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </span>
  )
}
