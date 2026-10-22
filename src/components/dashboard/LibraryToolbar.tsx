import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { CardSize } from "@/hooks/use-world-card-size"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { Recency } from "@/lib/library-recency"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { CardSizeControl } from "./CardSizeControl"
import { ClearSearchButton } from "./ClearSearchButton"
import { LibraryFilterPopover } from "./LibraryFilterPopover"
import { LibraryNewButton } from "./LibraryNewButton"
import { WorldViewToggle } from "./WorldViewToggle"

type Props = {
  query: string
  onQuery: (query: string) => void
  recency: Recency
  onRecency: (recency: Recency) => void
  mode: WorldViewMode
  onMode: (mode: WorldViewMode) => void
  // Whether the graph is offered; only for world entries.
  graph: boolean
  cardSize: CardSize
  onCardSize: (size: CardSize) => void
  // What New makes in the section that is open.
  makes: WorldEntryKind[]
  onNew: (kind: WorldEntryKind) => void
}

// Under the library's title: search, filter, how to look, and New for the section.
// Unlike a campaign's World, the search is always a field.
export function LibraryToolbar(props: Props) {
  const modes: WorldViewMode[] = props.graph ? ["list", "grid", "graph"] : ["list", "grid"]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="min-w-0 flex-1 sm:max-w-sm">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={props.query}
          onChange={(event) => props.onQuery(event.target.value)}
          placeholder="Search your library"
          aria-label="Search your library"
        />
        <ClearSearchButton value={props.query} onClear={() => props.onQuery("")} />
      </InputGroup>
      <div className="ml-auto flex items-center gap-2">
        <LibraryFilterPopover recency={props.recency} onRecency={props.onRecency} />
        {props.mode === "grid" && <CardSizeControl value={props.cardSize} onChange={props.onCardSize} />}
        <div className="max-md:hidden">
          <WorldViewToggle mode={props.mode} onChange={props.onMode} modes={modes} />
        </div>
        <LibraryNewButton kinds={props.makes} onPick={props.onNew} />
      </div>
    </div>
  )
}
