import { useLocation } from "react-router-dom"
import { withItem } from "@/lib/library-nav"
import { useWorldScope } from "./useWorldScope"

// Where an entry opens from a list. In the library it opens in the panel beside the list, which
// is the address's ?item=; elsewhere it is the entry's own page. `openId` is the one in the panel.
export function useEntryPanel() {
  const { basePath, inPanel } = useWorldScope()
  const { search } = useLocation()
  const openId = inPanel ? new URLSearchParams(search).get("item") : null
  const href = (id: string) => (inPanel ? withItem(search, id) : `${basePath}/${id}`)
  return { openId, href }
}
