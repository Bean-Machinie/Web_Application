import { Globe2, SearchX } from "lucide-react"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = {
  kind: WorldEntryKind | null
  // True when entries exist but the search or filter hides them all.
  filtered: boolean
  canManage: boolean
}

export function WorldEmptyState({ kind, filtered, canManage }: Props) {
  const Icon = filtered ? SearchX : Globe2
  const what = kind ? WORLD_KINDS[kind].plural.toLowerCase() : "entries"

  const title = filtered
    ? "No matches"
    : canManage
      ? `No ${what} yet`
      : `No ${what} revealed yet`
  const body = filtered
    ? "Try a different name, or clear the filter."
    : canManage
      ? `Create your first ${kind ? WORLD_KINDS[kind].label.toLowerCase() : "entry"} to start building the world.`
      : "What your GM reveals will show up here."

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground max-w-xs text-sm">{body}</p>
    </div>
  )
}
