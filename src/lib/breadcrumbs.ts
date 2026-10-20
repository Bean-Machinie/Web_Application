import type { BackTo } from "./back-link"
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

// The maps above a page, outermost first: the map its marker was on, and the
// ones that map was reached through. Reaching a map that is already in the chain goes back to it
// instead of adding to it, so a map that links back to its parent cannot grow
// the trail.
export function mapsAbove(pageId: string, from: BackTo | null, basePath: string): Crumb[] {
  if (!from) return []
  const chain = [...(from.maps ?? []), { label: from.label, to: from.path }]
  const own = chain.findIndex((crumb) => crumb.to === `${basePath}/${pageId}`)
  return own >= 0 ? chain.slice(0, own) : chain
}

// The trail says where a page lives, not how someone got there: World, then
// the entry. Arriving from a map's marker puts the maps on the way, all of
// them, between World and the entry; nothing else is carried along, so the
// trail only grows with how deeply maps are nested. Going back is the
// browser's job.
export function entryTrail(
  entry: { id: string; name: string },
  from: BackTo | null,
  scope: TrailRoot
): Crumb[] {
  return [root(scope), ...mapsAbove(entry.id, from, scope.basePath), { label: entry.name }]
}
