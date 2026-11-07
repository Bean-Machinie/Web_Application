import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { VisibilityFilter } from "@/lib/world-list"
import { AddFromLibraryButton } from "./AddFromLibraryButton"
import { ClearSearchButton } from "./ClearSearchButton"
import { FilterPopover } from "./FilterPopover"
import { NewEntryButton } from "./NewEntryButton"
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
}

// The right of the toolbar, laid out like the campaigns on Home: a search field and a
// filter, then how to look, then what to add.
export function WorldToolbar(props: Props) {
  const { query, onQuery, visibility, onVisibility, onCreate, onLibraryAdded, mode, onMode } = props

  return (
    <>
      <InputGroup className="w-56 min-w-32 shrink">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} size={16} />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search entries"
        />
        <ClearSearchButton value={query} onClear={() => onQuery("")} />
      </InputGroup>
      {visibility && (
        <FilterPopover
          groups={[
            {
              label: "Visibility",
              value: visibility,
              options: [
                { value: "all", label: "All" },
                { value: "hidden", label: "Hidden" },
                { value: "revealed", label: "Revealed" },
              ],
              onChange: (value) => onVisibility(value as VisibilityFilter),
            },
          ]}
        />
      )}
      <div className="max-md:hidden">
        <WorldViewToggle mode={mode} onChange={onMode} />
      </div>
      {onLibraryAdded && <AddFromLibraryButton onAdded={onLibraryAdded} />}
      {onCreate && <NewEntryButton onPick={onCreate} />}
    </>
  )
}
