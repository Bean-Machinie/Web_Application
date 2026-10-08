import type { BackTo } from "./back-link"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// One step of the trail in the app header. The last one has no link.
export type Crumb = { label: string; to?: string }

const WORLD: Crumb = { label: "World", to: "/app/world" }

// How someone got to an entry. From a map's marker it leads back to that map;
// a map sits directly under World; anything else sits under its kind's tab.
export function entryTrail(
  entry: { kind: WorldEntryKind; name: string },
  from: BackTo | null
): Crumb[] {
  if (from) return [WORLD, { label: from.label, to: from.path }, { label: entry.name }]
  if (entry.kind === "map") return [WORLD, { label: entry.name }]
  return [
    WORLD,
    { label: WORLD_KINDS[entry.kind].plural, to: `/app/world?kind=${entry.kind}` },
    { label: entry.name },
  ]
}
