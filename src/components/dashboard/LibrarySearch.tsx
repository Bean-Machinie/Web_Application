import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ClearSearchButton } from "./ClearSearchButton"

// `label` says what is searched, for screen readers; the field itself just says "Search", as every
// search in the app does, because the menu beside it already names the scope.
type Props = { query: string; onQuery: (query: string) => void; label?: string }

// The left of the library's toolbar row. Unlike a campaign's World, the search is
// always a field.
export function LibrarySearch({ query, onQuery, label = "Search your library" }: Props) {
  return (
    // Gives way before anything else in the toolbar does, down to a width that still reads.
    <div className="flex w-64 min-w-36 shrink items-center">
      <InputGroup className="w-full">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} size={16} />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          aria-label={label}
        />
        <ClearSearchButton value={query} onClear={() => onQuery("")} />
      </InputGroup>
    </div>
  )
}
