import { createContext } from "react"

// What the cards and rows of the library need of its tabs: which item is showing, and the two ways
// to open one (the right-click menu's "Open in new tab" is the second).
export type LibraryTabsApi = {
  activeId: string | null
  openNew: (id: string) => void
}

export const LibraryTabsContext = createContext<LibraryTabsApi | null>(null)
