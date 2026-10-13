import {
  createLibraryEntry,
  createWorldEntry,
  fetchLibraryEntries,
  fetchWorldEntries,
  reorderLibraryEntries,
  reorderWorldEntries,
} from "./world-entries"
import type { WorldEntry } from "./world-entries"
import { fetchLibrarySearchText, fetchSearchText } from "./world-search"
import type { SearchText } from "./world-search"
import { worldKinds } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// Where the World pages are looking: today a campaign's world, later also a
// person's library. The list, the entry page and their hooks only talk to
// this, so one set of components serves both.
export type WorldScope = {
  // Keys caches and the remembered list. Unique per place.
  key: string
  // Where the list lives; an entry's page is at `${basePath}/${id}`.
  basePath: string
  // The first step of the trail in the app header.
  label: string
  canManage: boolean
  // The kinds that can be made here, in tab order.
  kinds: WorldEntryKind[]
  // Whether entries are hidden from or revealed to players. A library is
  // private to its owner, so it has neither.
  hasVisibility: boolean
  // Whether its entries can be copied into the library.
  canSaveToLibrary: boolean
  // First folder of the files of this scope's entries in storage.
  imageFolder: string
  fetchEntries: () => Promise<WorldEntry[]>
  createEntry: (kind: WorldEntryKind, name: string) => Promise<WorldEntry>
  reorderEntries: (orderedIds: string[]) => Promise<void>
  fetchSearchText: () => Promise<SearchText>
}

export function campaignScope(campaignId: string, canManage: boolean): WorldScope {
  return {
    // The campaign id itself, so what was remembered before stays valid.
    key: campaignId,
    basePath: "/app/world",
    label: "World",
    canManage,
    kinds: worldKinds,
    hasVisibility: true,
    canSaveToLibrary: true,
    imageFolder: campaignId,
    fetchEntries: () => fetchWorldEntries(campaignId),
    createEntry: (kind, name) => createWorldEntry(campaignId, kind, name),
    reorderEntries: (orderedIds) => reorderWorldEntries(campaignId, orderedIds),
    fetchSearchText: () => fetchSearchText(campaignId),
  }
}

// A person's own library. They can always manage it, and maps are not
// supported in it yet.
export function libraryScope(userId: string): WorldScope {
  return {
    key: `library:${userId}`,
    basePath: "/app/library",
    label: "Your library",
    canManage: true,
    kinds: worldKinds.filter((kind) => kind !== "map"),
    hasVisibility: false,
    canSaveToLibrary: false,
    imageFolder: userId,
    fetchEntries: fetchLibraryEntries,
    createEntry: createLibraryEntry,
    reorderEntries: reorderLibraryEntries,
    fetchSearchText: fetchLibrarySearchText,
  }
}
