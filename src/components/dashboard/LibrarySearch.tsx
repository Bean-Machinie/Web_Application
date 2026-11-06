import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ClearSearchButton } from "./ClearSearchButton"

type Props = { query: string; onQuery: (query: string) => void; placeholder?: string }

// The left of the library's toolbar row. Unlike a campaign's World, the search is
// always a field.
export function LibrarySearch({ query, onQuery, placeholder = "Search your library" }: Props) {
  return (
    <div className="flex items-center">
      <InputGroup className="w-full sm:w-64">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} size={16} />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <ClearSearchButton value={query} onClear={() => onQuery("")} />
      </InputGroup>
    </div>
  )
}
