import { useSyncExternalStore } from "react"
import type { SaveStore } from "@/lib/scene-save-store"

// The draft's saving as it is now, for the few things that show it.
export function useSaveStatus(store: SaveStore) {
  return useSyncExternalStore(store.subscribe, store.get)
}
