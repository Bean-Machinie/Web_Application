import { Globe2, SearchX } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { useWorldScope } from "./useWorldScope"

type Props = {
  kind: WorldEntryKind | null
  // True when entries exist but the search or filter hides them all.
  filtered: boolean
  canManage: boolean
}

export function WorldEmptyState({ kind, filtered, canManage }: Props) {
  const { hasVisibility } = useWorldScope()
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
      ? `Create your first ${kind ? WORLD_KINDS[kind].label.toLowerCase() : "entry"} to start building ${hasVisibility ? "the world" : "your library"}.`
      : "What your GM reveals will show up here."

  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{body}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
