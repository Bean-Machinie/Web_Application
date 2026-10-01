import type { WorldEntry } from "@/lib/world-entries"
import { WorldEntryCard } from "./WorldEntryCard"
import type { WorldManage } from "./world-manage"

export const gridClass =
  "grid grid-cols-2 gap-4 p-4 sm:p-6 md:grid-cols-3 xl:grid-cols-4"

type Props = { entries: WorldEntry[]; manage: WorldManage | null }

export function WorldEntryGrid({ entries, manage }: Props) {
  return (
    <div className={gridClass}>
      {entries.map((entry) => (
        <WorldEntryCard key={entry.id} entry={entry} manage={manage} />
      ))}
    </div>
  )
}
