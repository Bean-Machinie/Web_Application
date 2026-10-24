import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ClearSearchButton } from "./ClearSearchButton"

type Props = { query: string; onQuery: (query: string) => void }

// The left of the library's toolbar row. Unlike a campaign's World, the search is
// always a field.
export function LibrarySearch({ query, onQuery }: Props) {
  return (
    <div className="flex items-center md:h-12">
      <InputGroup className="w-full sm:w-64">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search your library"
          aria-label="Search your library"
        />
        <ClearSearchButton value={query} onClear={() => onQuery("")} />
      </InputGroup>
    </div>
  )
}
