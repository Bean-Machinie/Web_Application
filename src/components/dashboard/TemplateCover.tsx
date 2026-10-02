import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { cn } from "@/lib/utils"

type Props = {
  kinds: WorldEntryKind[]
  small?: boolean
}

// The kinds a template holds, as overlapping icon circles.
export function TemplateCover({ kinds, small }: Props) {
  return (
    <div className="flex items-center">
      {kinds.map((kind, index) => {
        const Icon = WORLD_KINDS[kind].icon
        return (
          <span
            key={kind}
            className={cn(
              "bg-background text-muted-foreground ring-card flex items-center justify-center rounded-full border ring-2",
              small ? "size-8" : "size-12",
              index > 0 && (small ? "-ml-2" : "-ml-3")
            )}
          >
            <Icon className={small ? "size-4" : "size-5"} />
          </span>
        )
      })}
    </div>
  )
}
