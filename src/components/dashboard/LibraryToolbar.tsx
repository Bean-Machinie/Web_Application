import type { CardSize } from "@/hooks/use-world-card-size"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { CardSizeControl } from "./CardSizeControl"
import { FilterPopover } from "./FilterPopover"
import type { FilterGroup } from "./FilterPopover"
import { LibraryNewButton } from "./LibraryNewButton"
import { WorldViewToggle } from "./WorldViewToggle"

type Props = {
  filters: FilterGroup[]
  mode: WorldViewMode
  onMode: (mode: WorldViewMode) => void
  // The views offered: the graph only for world entries.
  modes: WorldViewMode[]
  cardSize: CardSize
  onCardSize: (size: CardSize) => void
  // What New makes in the node that is open; none under the SRD, which cannot be added to.
  makes: WorldEntryKind[]
  onNew: (kind: WorldEntryKind) => void
}

// The right of the library's toolbar, the same for every node: filter, how to look, and New
// where there is something to make.
export function LibraryToolbar(props: Props) {
  return (
    <>
      <FilterPopover groups={props.filters} />
      {props.mode === "grid" && <CardSizeControl value={props.cardSize} onChange={props.onCardSize} />}
      {props.modes.length > 1 && (
        <div className="max-md:hidden">
          <WorldViewToggle mode={props.mode} onChange={props.onMode} modes={props.modes} />
        </div>
      )}
      {props.makes.length > 0 && <LibraryNewButton kinds={props.makes} onPick={props.onNew} />}
    </>
  )
}
