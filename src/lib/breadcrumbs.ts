import type { BackTo } from "./back-link"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"
import { worldListPath } from "./world-tab"

// One step of the trail in the app header. The last one has no link.
export type Crumb = { label: string; to?: string }

// The list an entry lives in: its label and where it is.
export type TrailRoot = { label: string; basePath: string }

// The first step leads to the tab the list was last on.
const root = (scope: TrailRoot): Crumb => ({
  label: scope.label,
  to: worldListPath(scope.basePath),
})

const tab = (scope: TrailRoot, kind: WorldEntryKind): Crumb => ({
  label: WORLD_KINDS[kind].plural,
  to: `${scope.basePath}?kind=${kind}`,
})

// The maps above a page, outermost first: the map its marker was on, and the
// ones that map was reached through. Reaching a map that is already in the chain goes back to it
// instead of adding to it, so a map that links back to its parent cannot grow
// the trail.
export function mapsAbove(pageId: string, from: BackTo | null): Crumb[] {
  if (!from) return []
  const chain = [...(from.maps ?? []), { label: from.label, to: from.path }]
  const own = chain.findIndex((crumb) => crumb.to === `/app/world/${pageId}`)
  return own >= 0 ? chain.slice(0, own) : chain
}

// The trail says where a page lives, not how someone got there: World, its
// kind's tab, then the entry. Arriving from a map's marker puts the maps on the
// way, all of them, between Maps and the entry; nothing else is carried along,
// so the trail only grows with how deeply maps are nested. Going back is the
// browser's job.
export function entryTrail(
  entry: { id: string; kind: WorldEntryKind; name: string },
  from: BackTo | null,
  scope: TrailRoot
): Crumb[] {
  if (!from) return [root(scope), tab(scope, entry.kind), { label: entry.name }]
  return [root(scope), tab(scope, "map"), ...mapsAbove(entry.id, from), { label: entry.name }]
}
