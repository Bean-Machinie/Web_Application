import type { WorldEntryKind } from "@/lib/world-kinds"
import { AddFromLibraryButton } from "./AddFromLibraryButton"
import { NewEntryButton } from "./NewEntryButton"
import { useWorldScope } from "./useWorldScope"

type Props = {
  // Null until the entries are loaded.
  count: number | null
  onCreate: ((kind: WorldEntryKind) => void) | null
  // Reloads the list after entries were added from the library; null where
  // that is not offered.
  onLibraryAdded: (() => Promise<unknown>) | null
}

// The page title with how much is in it, and the actions that make more.
export function WorldHeading({ count, onCreate, onLibraryAdded }: Props) {
  const scope = useWorldScope()

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">{scope.label}</h1>
        {count !== null && (
          <p className="text-muted-foreground text-sm">
            {count === 1 ? "1 entry" : `${count} entries`}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onLibraryAdded && <AddFromLibraryButton onAdded={onLibraryAdded} />}
        {onCreate && <NewEntryButton onPick={onCreate} />}
      </div>
    </div>
  )
}
