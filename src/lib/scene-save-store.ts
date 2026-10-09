// What the draft's saving is up to, kept outside React's tree of components so that a
// save changing it redraws only what shows it (the status and the banners), never the
// builder and its thousands of pieces of art.
export type SceneSaveState = "saved" | "pending" | "saving" | "error" | "conflict"

export type SaveSnapshot = {
  state: SceneSaveState
  // Set while the builder waits on a save that someone asked for (leaving, publishing),
  // as the only time a save is worth saying anything about.
  flushing: boolean
  error: string | null
  // How big the scene was when it was last saved, against the most it can be.
  bytes: number
  // Changed since the map image players see was rendered.
  unpublished: boolean
  // When the draft last reached the server, or null if it has not in this visit.
  savedAt: number | null
}

export function createSaveStore(initial: Pick<SaveSnapshot, "unpublished">) {
  let snapshot: SaveSnapshot = {
    state: "saved",
    flushing: false,
    error: null,
    bytes: 0,
    savedAt: null,
    ...initial,
  }
  const watchers = new Set<() => void>()

  return {
    get: () => snapshot,
    subscribe(watcher: () => void) {
      watchers.add(watcher)
      return () => {
        watchers.delete(watcher)
      }
    },
    // A change that changes nothing tells no one, so typing on does not redraw anything.
    set(change: Partial<SaveSnapshot>) {
      const next = { ...snapshot, ...change }
      if ((Object.keys(next) as (keyof SaveSnapshot)[]).every((key) => next[key] === snapshot[key])) return
      snapshot = next
      watchers.forEach((watcher) => watcher())
    },
  }
}

export type SaveStore = ReturnType<typeof createSaveStore>
