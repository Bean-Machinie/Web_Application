import type { ConnectionGroupKey, ConnectionRow } from "@/lib/connection-groups"
import { rememberReturn } from "@/lib/map-view"

// How far in a map opens on a pin, counted from fully zoomed out.
const MAP_OPEN_ZOOM = 1.5

// Where a click on a connection goes. "On maps" opens the map framed on the pin
// and remembers which pin it was left through; "Pins" opens the pinned entry with
// this map as where it was found, as a click on the pin itself does; the rest
// just open the entry.
export function connectionTarget(
  group: ConnectionGroupKey,
  row: ConnectionRow,
  basePath: string,
  from: { id: string; name: string }
) {
  const to = `${basePath}/${row.entry.id}`

  if (group === "onMaps") {
    const { markerId, x, y } = row.first
    return {
      to: `${to}?view=${x},${y},${MAP_OPEN_ZOOM}`,
      state: undefined,
      onOpen: () => markerId && rememberReturn(row.entry.id, markerId),
    }
  }

  return {
    to,
    state:
      group === "pins"
        ? { backTo: { path: `${basePath}/${from.id}`, label: from.name } }
        : undefined,
    onOpen: undefined,
  }
}
