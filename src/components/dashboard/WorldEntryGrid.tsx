import { useRef } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { useRowReorder } from "@/hooks/use-row-reorder"
import { useSelectionBox } from "@/hooks/use-selection-box"
import type { WorldEntry } from "@/lib/world-entries"
import { SelectionBox } from "./SelectionBox"
import { WorldEntryCard } from "./WorldEntryCard"
import type { WorldManage } from "./world-manage"

export const gridClass =
  "grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 xl:grid-cols-4"

// Only the entries scroll; everything above stays put.
export const scrollClass =
  "min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"

type Props = {
  entries: WorldEntry[]
  manage: WorldManage | null
  // Null where nothing can be picked, such as for players.
  selection: EntrySelection | null
}

const NOTHING: ReadonlySet<string> = new Set()

export function WorldEntryGrid({ entries, manage, selection }: Props) {
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
    selected: selection?.selected ?? NOTHING,
    onSelect: (ids) => selection?.set(ids),
    onClear: () => selection?.clear(),
  })

  return (
    <div
      ref={scroller}
      data-world-scroll
      onPointerDown={onPointerDown}
      className={`${scrollClass} ${gridClass} relative content-start [scrollbar-gutter:stable]`}
    >
      <SelectionBox box={box} />
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          data-entry-id={entry.id}
          // The wrapper moves; the card inside takes the lifted look.
          className="rounded-lg select-none [-webkit-touch-callout:none] data-lifted:*:border-ring data-lifted:*:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
          {...rowProps(entry.id, index)}
        >
          <WorldEntryCard entry={entry} manage={manage} selection={selection} />
        </div>
      ))}
    </div>
  )
}
