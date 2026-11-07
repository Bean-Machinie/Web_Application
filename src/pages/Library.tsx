import { Navigate, useSearchParams } from "react-router-dom"
import { LibraryPage } from "@/components/dashboard/LibraryPage"

// The library is a page of its own: the sidebar and the command palette lead here. Characters and
// the SRD used to be sections of it, so links to those go to their new pages.
export function Library() {
  const [params] = useSearchParams()
  const section = params.get("section")

  if (section === "characters") return <Navigate to="/app/characters" replace />
  if (section?.startsWith("srd:")) return <Navigate to={`/app/compendium?${params}`} replace />
  return <LibraryPage />
}
