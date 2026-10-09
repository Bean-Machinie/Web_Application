import type { BackTo } from "./back-link"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"
import { worldListPath } from "./world-tab"

// One step of the trail in the app header. The last one has no link.
// "state" is passed along when the step is followed, so the page it opens still
// knows the steps before it.
export type Crumb = { label: string; to?: string; state?: unknown }

// The World step leads to the tab the list was last on.
const world = (): Crumb => ({ label: "World", to: worldListPath() })

// What a step should pass on: the step before it, with the ones before that.
// Directly under World there is nothing to pass.
function stateFor(before: Crumb[]) {
  const last = before[before.length - 1]
  if (before.length < 2 || !last.to) return undefined
  return { backTo: { path: last.to, label: last.label, before: before.slice(0, -1) } }
}

// The steps leading to the page that someone came from, ending with that page.
export function trailThrough(from: BackTo | null): Crumb[] {
  if (!from) return [world()]
  const before = from.before ?? [world()]
  return [...before, { label: from.label, to: from.path, state: stateFor(before) }]
}

// How someone got to an entry. From a map's marker it leads back to that map;
// a map sits directly under World; anything else sits under its kind's tab.
export function entryTrail(
  entry: { kind: WorldEntryKind; name: string },
  from: BackTo | null
): Crumb[] {
  if (from) return [...trailThrough(from), { label: entry.name }]
  if (entry.kind === "map") return [world(), { label: entry.name }]
  return [
    world(),
    { label: WORLD_KINDS[entry.kind].plural, to: `/app/world?kind=${entry.kind}` },
    { label: entry.name },
  ]
}
