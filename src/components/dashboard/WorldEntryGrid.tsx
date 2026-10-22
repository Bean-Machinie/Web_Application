import { useRef } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { CardSize } from "@/hooks/use-world-card-size"
import { useRowReorder } from "@/hooks/use-row-reorder"
import { useSelectionBox } from "@/hooks/use-selection-box"
import type { WorldEntry } from "@/lib/world-entries"
import { SelectHint } from "./SelectHint"
import { SelectionBox } from "./SelectionBox"
import { WorldEntryCard } from "./WorldEntryCard"
import { gridStyle } from "./world-grid-style"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  manage: WorldManage | null
  // Null where nothing can be picked, such as for players.
  selection: EntrySelection | null
  size: CardSize
  // Landscape cards, for maps.
  wide?: boolean
}

const NOTHING: ReadonlySet<string> = new Set()

export function WorldEntryGrid({ entries, manage, selection, size, wide }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    // Holding a card to move it would fight with picking cards.
    onReorder: selection?.active ? undefined : manage?.onReorder,
    grid: true,
  })
  const { onPointerDown, box } = useSelectionBox({
    container: scroller,
    enabled: selection !== null,
    pageScroll: true,
    selected: selection?.selected ?? NOTHING,
    onSelect: (ids) => selection?.set(ids),
    onClear: () => selection?.clear(),
  })

  return (
    <div
      ref={scroller}
      onPointerDown={onPointerDown}
      style={gridStyle(size, wide)}
      className="relative grid flex-1 content-start gap-4"
    >
      <SelectionBox box={box} />
      {entries.map((entry, index) => {
        const card = (
          <div
            key={entry.id}
            data-entry-id={entry.id}
            // The wrapper moves; the card inside takes the lifted look.
            className="rounded-lg select-none [-webkit-touch-callout:none] data-lifted:*:border-ring data-lifted:*:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
            {...rowProps(entry.id, index)}
          >
            <WorldEntryCard entry={entry} manage={manage} selection={selection} wide={wide} />
          </div>
        )
        return selection ? (
          <SelectHint key={entry.id} kind="list">
            {card}
          </SelectHint>
        ) : (
          card
        )
      })}
    </div>
  )
}
