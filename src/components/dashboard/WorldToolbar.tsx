import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { VisibilityFilter } from "@/lib/world-list"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { WorldViewToggle } from "./WorldViewToggle"

type Props = {
  query: string
  onQuery: (query: string) => void
  // Null for players, who only ever see revealed entries.
  visibility: VisibilityFilter | null
  onVisibility: (visibility: VisibilityFilter) => void
  mode: WorldViewMode
  onMode: (mode: WorldViewMode) => void
}

export function WorldToolbar(props: Props) {
  const { query, onQuery, visibility, onVisibility, mode, onMode } = props

  return (
    <div className="flex shrink-0 items-center gap-2">
      <InputGroup className="min-w-0 flex-1 sm:max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search entries"
        />
      </InputGroup>
      {visibility && (
        <Select
          value={visibility}
          onValueChange={(value) => onVisibility(value as VisibilityFilter)}
        >
          <SelectTrigger aria-label="Filter by visibility" className="w-32 sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="revealed">Revealed</SelectItem>
          </SelectContent>
        </Select>
      )}
      <div className="ml-auto max-md:hidden">
        <WorldViewToggle mode={mode} onChange={onMode} />
      </div>
    </div>
  )
}
