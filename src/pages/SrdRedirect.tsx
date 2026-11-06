import { Navigate, useParams } from "react-router-dom"
import { srdPath } from "@/lib/srd-paths"

// The compendium and the rules used to be pages of a campaign; old links land in the library's SRD.
export function SrdRedirect() {
  const { section, itemId, termId } = useParams()
  const to = section === "monsters" ? srdPath("creatures", itemId) : srdPath("rules", termId ?? itemId)
  return <Navigate to={to} replace />
}
