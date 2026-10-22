import type { CardSize } from "@/hooks/use-world-card-size"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { VisibilityFilter } from "@/lib/world-list"
import { AddFromLibraryButton } from "./AddFromLibraryButton"
import { CardSizeControl } from "./CardSizeControl"
import { ExpandingSearch } from "./ExpandingSearch"
import { NewEntryButton } from "./NewEntryButton"
import { WorldFilterPopover } from "./WorldFilterPopover"
import { WorldViewToggle } from "./WorldViewToggle"

type Props = {
  query: string
  onQuery: (query: string) => void
  // Null for players, who only ever see revealed entries and have nothing to filter.
  visibility: VisibilityFilter | null
  onVisibility: (visibility: VisibilityFilter) => void
  onCreate: ((kind: WorldEntryKind) => void) | null
  // Reloads the list after entries were added from the library; null where
  // that is not offered.
  onLibraryAdded: (() => Promise<unknown>) | null
  mode: WorldViewMode
  onMode: (mode: WorldViewMode) => void
  cardSize: CardSize
  onCardSize: (size: CardSize) => void
}

// The right of the toolbar: find, filter, how to look, and what to add.
export function WorldToolbar(props: Props) {
  const { query, onQuery, visibility, onVisibility, onCreate, onLibraryAdded, mode, onMode } = props

  return (
    <>
      <ExpandingSearch value={query} onChange={onQuery} label="Search entries" />
      {visibility && (
        <WorldFilterPopover
          visibility={visibility}
          onVisibility={onVisibility}
          active={visibility === "all" ? 0 : 1}
        />
      )}
      {mode === "grid" && <CardSizeControl value={props.cardSize} onChange={props.onCardSize} />}
      <div className="max-md:hidden">
        <WorldViewToggle mode={mode} onChange={onMode} />
      </div>
      {onLibraryAdded && <AddFromLibraryButton onAdded={onLibraryAdded} />}
      {onCreate && <NewEntryButton onPick={onCreate} />}
    </>
  )
}
