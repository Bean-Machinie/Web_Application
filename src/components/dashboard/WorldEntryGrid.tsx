import { useRowReorder } from "@/hooks/use-row-reorder"
import type { WorldEntry } from "@/lib/world-entries"
import { WorldEntryCard } from "./WorldEntryCard"
import type { WorldManage } from "./world-manage"

export const gridClass =
  "grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 xl:grid-cols-4"

type Props = { entries: WorldEntry[]; manage: WorldManage | null }

export function WorldEntryGrid({ entries, manage }: Props) {
  const { rowProps } = useRowReorder({
    ids: entries.map((entry) => entry.id),
    onReorder: manage?.onReorder,
    grid: true,
  })

  return (
    <div className={gridClass}>
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          // The wrapper moves; the card inside takes the lifted look.
          className="rounded-xl select-none [-webkit-touch-callout:none] data-lifted:*:border-ring data-lifted:*:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
          {...rowProps(entry.id, index)}
        >
          <WorldEntryCard entry={entry} manage={manage} />
        </div>
      ))}
    </div>
  )
}
