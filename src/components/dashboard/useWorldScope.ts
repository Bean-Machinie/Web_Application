import { useContext } from "react"
import { WorldScopeContext } from "./WorldScopeContext"

// Only valid below a provider, such as CampaignWorldScope.
export function useWorldScope() {
  const scope = useContext(WorldScopeContext)
  if (!scope) throw new Error("useWorldScope needs a WorldScopeContext provider.")
  return scope
}
