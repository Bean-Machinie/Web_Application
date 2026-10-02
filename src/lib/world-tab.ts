import type { WorldEntryKind } from "./world-kinds"

// The tab the World list was last on, so "< World" on an entry page goes back
// to it instead of to All. Kept for the length of the visit.
let lastKind: WorldEntryKind | null = null

export function rememberWorldKind(kind: WorldEntryKind | null) {
  lastKind = kind
}

export function worldListPath() {
  return lastKind ? `/app/world?kind=${lastKind}` : "/app/world"
}
