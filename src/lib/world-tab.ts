import type { WorldEntryKind } from "./world-kinds"

// The tab each list was last on, so "< World" on an entry page goes back to it
// instead of to All. Kept for the length of the visit.
const lastKind = new Map<string, WorldEntryKind | null>()

export function rememberWorldKind(basePath: string, kind: WorldEntryKind | null) {
  lastKind.set(basePath, kind)
}

export function worldListPath(basePath: string) {
  const kind = lastKind.get(basePath)
  return kind ? `${basePath}?kind=${kind}` : basePath
}
