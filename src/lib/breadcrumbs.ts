import type { BackTo } from "./back-link"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"
import { worldListPath } from "./world-tab"

// One step of the trail in the app header. The last one has no link.
export type Crumb = { label: string; to?: string }

// The World step leads to the tab the list was last on.
const world = (): Crumb => ({ label: "World", to: worldListPath() })

// How someone got to an entry. From a map's marker it leads back to that map;
// a map sits directly under World; anything else sits under its kind's tab.
export function entryTrail(
  entry: { kind: WorldEntryKind; name: string },
  from: BackTo | null
): Crumb[] {
  if (from) return [world(), { label: from.label, to: from.path }, { label: entry.name }]
  if (entry.kind === "map") return [world(), { label: entry.name }]
  return [
    world(),
    { label: WORLD_KINDS[entry.kind].plural, to: `/app/world?kind=${entry.kind}` },
    { label: entry.name },
  ]
}
