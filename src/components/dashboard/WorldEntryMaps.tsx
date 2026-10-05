import { useLocation } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useEntryPlacements } from "@/hooks/use-entry-placements"
import { readBackTo } from "@/lib/back-link"
import { entryTrail } from "@/lib/breadcrumbs"
import { MapPlacementCard } from "./MapPlacementCard"
import type { PlacedEntry } from "./MapPlacementPreview"

type Props = { entryId: string; entry: PlacedEntry }

// Where the entry stands on maps, if anywhere. Render with key={entryId}.
// Only the maps and markers the viewer may see are sent at all.
export function WorldEntryMaps({ entryId, entry }: Props) {
  const placements = useEntryPlacements(entryId)
  const from = readBackTo(useLocation().state)

  if (placements?.length === 0) return null
  if (!placements) return (
      <div className="grid grid-cols-2 gap-4 border-t py-5 md:grid-cols-3 xl:grid-cols-4">
        <Skeleton className="aspect-[3/4] w-full" />
      </div>
    )

  // A map opened from here leads back through however this page was reached.
  const backTo = {
    path: `/app/world/${entryId}`,
    label: entry.name,
    before: entryTrail(entry, from).slice(0, -1),
  }

  return (
    <section className="grid grid-cols-2 gap-4 border-t py-5 md:grid-cols-3 xl:grid-cols-4">
      {placements.map((placement) => (
        <MapPlacementCard
          key={placement.id}
          placement={placement}
          entry={entry}
          backTo={backTo}
        />
      ))}
    </section>
  )
}
