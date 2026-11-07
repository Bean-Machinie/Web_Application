import { useContext } from "react"
import { useLocation } from "react-router-dom"
import { withItem } from "@/lib/library-nav"
import { LibraryTabsContext } from "./LibraryTabsContext"
import { useWorldScope } from "./useWorldScope"

// Where an entry opens from a list. In the library it opens in a tab of the panel beside the list:
// the link carries ?item=, which the library turns into a tab. Elsewhere it is the entry's own page.
// `openId` is the one showing in the panel; `openNew` (the library only) opens one in a new tab.
export function useEntryPanel() {
  const { basePath, inPanel } = useWorldScope()
  const { search } = useLocation()
  const tabs = useContext(LibraryTabsContext)
  const href = (id: string) => (inPanel ? withItem(search, id) : `${basePath}/${id}`)
  return { openId: inPanel ? (tabs?.activeId ?? null) : null, href, openNew: inPanel ? (tabs?.openNew ?? null) : null }
}
