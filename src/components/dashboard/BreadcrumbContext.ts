import { createContext } from "react"
import type { Crumb } from "@/lib/breadcrumbs"

type Value = {
  // Null on a page that sets none: the header then shows the page's title.
  trail: Crumb[] | null
  setTrail: (trail: Crumb[] | null) => void
}

export const BreadcrumbContext = createContext<Value>({ trail: null, setTrail: () => {} })
