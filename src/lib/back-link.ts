import type { Crumb } from "./breadcrumbs"

// Passed in router state by a map's marker, so the page it opens shows that map
// as where it was found. "maps" are the maps above that one, when it was itself
// reached through a map. Only maps are ever carried along.
export type BackTo = { path: string; label: string; maps?: Crumb[] }

export function readBackTo(state: unknown): BackTo | null {
  const candidate = (state as { backTo?: Partial<BackTo> } | null)?.backTo
  return typeof candidate?.path === "string" && typeof candidate.label === "string"
    ? {
        path: candidate.path,
        label: candidate.label,
        maps: Array.isArray(candidate.maps) ? candidate.maps : undefined,
      }
    : null
}
