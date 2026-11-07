import { Navigate, useParams } from "react-router-dom"
import { srdPath } from "@/lib/srd-paths"

// The SRD used to be read in the library, at /app/library/srd/...; old links land in the compendium.
export function LibrarySrdRedirect() {
  const { section, itemId } = useParams()
  return <Navigate to={srdPath(section === "rules" ? "rules" : "creatures", itemId)} replace />
}
