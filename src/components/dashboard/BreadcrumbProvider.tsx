import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Crumb } from "@/lib/breadcrumbs"
import { BreadcrumbContext } from "./BreadcrumbContext"

// Holds the trail the open page asked for, for the header to show.
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [trail, setTrail] = useState<Crumb[] | null>(null)
  const value = useMemo(() => ({ trail, setTrail }), [trail])

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}
