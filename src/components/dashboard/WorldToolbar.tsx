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
  kind: WorldEntryKind | null
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
  const { kind, query, onQuery, visibility, onVisibility, onCreate, mode, onMode } = props

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 py-4">
      <div className="relative min-w-40 flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search by name"
          aria-label="Search entries by name"
          className="pl-8"
        />
      </div>
      {visibility && (
        <Select
          value={visibility}
          onValueChange={(value) => onVisibility(value as VisibilityFilter)}
        >
          <SelectTrigger aria-label="Filter by visibility" className="w-36">
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
        <WorldViewToggle mode={mode} onChange={onMode} />
        {onCreate && <NewEntryButton kind={kind} onPick={onCreate} />}
      </div>

    </div>
  )
}
