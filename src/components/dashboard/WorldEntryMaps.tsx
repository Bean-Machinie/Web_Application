import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { groupByMap } from "@/lib/world-map-markers"
import type { Placement } from "@/lib/world-map-markers"
import { MapPlacementCard } from "./MapPlacementCard"
import type { PlacedEntry } from "./MapPlacementPreview"

// More maps than this fold behind "Show all", so an entry that stands in many
// places does not take over the page.
const SHOWN = 3

type Props = { entry: PlacedEntry; placements: Placement[] }

// The maps the entry stands on, one card per map, for the side of the page.
// Only the maps and markers the viewer may see are sent at all.
export function WorldEntryMaps({ entry, placements }: Props) {
  const [all, setAll] = useState(false)
  const groups = useMemo(() => groupByMap(placements), [placements])
  const shown = all ? groups : groups.slice(0, SHOWN)

  return (
    <aside
      aria-label="Maps"
      className="flex flex-col gap-3 border-t py-5 motion-safe:animate-in motion-safe:fade-in lg:w-56 lg:shrink-0 lg:border-l lg:pl-6"
    >
      <h3 className="text-sm font-medium">
        On {groups.length === 1 ? "a map" : `${groups.length} maps`}
      </h3>
      <div className="grid gap-3">
        {shown.map((group) => (
          <MapPlacementCard key={group.first.mapId} group={group} entry={entry} />
        ))}
      </div>
      {groups.length > SHOWN && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground self-start"
          onClick={() => setAll((open) => !open)}
        >
          {all ? "Show fewer" : `Show all ${groups.length} maps`}
        </Button>
      )}
    </aside>
  )
}
