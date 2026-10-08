import { useContext, useEffect } from "react"
import type { Crumb } from "@/lib/breadcrumbs"
import { BreadcrumbContext } from "./BreadcrumbContext"

// A page calls this to give the header its trail, such as World / Characters /
// Tessa Vale. Pages that do not call it get their title alone. Pass null while
// the page does not know its trail yet.
export function usePageTrail(trail: Crumb[] | null) {
  const { setTrail } = useContext(BreadcrumbContext)
  // The trail is rebuilt on every render; only a change in it should count.
  const key = JSON.stringify(trail)

  useEffect(() => {
    setTrail(key === "null" ? null : (JSON.parse(key) as Crumb[]))
    return () => setTrail(null)
  }, [key, setTrail])
}
