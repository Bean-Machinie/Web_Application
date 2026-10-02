import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { VisibilityFilter } from "@/lib/world-list"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { NewEntryButton } from "./NewEntryButton"
import { WorldViewToggle } from "./WorldViewToggle"

type Props = {
  query: string
  onQuery: (query: string) => void
  // Null for players, who only ever see revealed entries.
  visibility: VisibilityFilter | null
  onVisibility: (visibility: VisibilityFilter) => void
  onCreate: ((kind: WorldEntryKind) => void) | null
  mode: WorldViewMode
  onMode: (mode: WorldViewMode) => void
}

export function WorldToolbar(props: Props) {
  const { query, onQuery, visibility, onVisibility, onCreate, mode, onMode } = props

  // Players have only the view switch besides the search, so on a phone they
  // share one row and the list gets the room.
  const searchOnly = !visibility && !onCreate

  return (
    // On phones: search on its own row, then the filter, view switch and New
    // together. From sm up the inner row dissolves into one line.
    <div
      className={`flex shrink-0 gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:px-6 sm:py-4 ${
        searchOnly ? "items-center" : "flex-col"
      }`}
    >
      <div
        className={`relative sm:max-w-xs sm:flex-1 ${searchOnly ? "min-w-0 flex-1" : "w-full"}`}
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search entries"
          className="pl-8"
        />
      </div>
      <div className="flex items-center gap-2 sm:contents">
        {visibility && (
          <Select
            value={visibility}
            onValueChange={(value) => onVisibility(value as VisibilityFilter)}
          >
            <SelectTrigger aria-label="Filter by visibility" className="min-w-0 flex-1 sm:w-36 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="revealed">Revealed</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="max-md:hidden">
          <WorldViewToggle mode={mode} onChange={onMode} />
        </div>
          {onCreate && <NewEntryButton onPick={onCreate} />}
        </div>
      </div>
    </div>
  )
}
