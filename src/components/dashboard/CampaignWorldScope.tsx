import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { campaignScope } from "@/lib/world-scope"
import { useCampaign } from "./useCampaign"
import { WorldScopeContext } from "./WorldScopeContext"

// Gives the pages below it the current campaign's world. Only used inside
// RequireCampaign, so there is always a campaign.
export function CampaignWorldScope() {
  const { current, can } = useCampaign()
  const campaignId = current?.id
  const canManage = can("manage_world")
  // Stable, since the hooks that load entries start over when it changes.
  const scope = useMemo(
    () => (campaignId ? campaignScope(campaignId, canManage) : null),
    [campaignId, canManage]
  )

  if (!scope) return null

  return (
    <WorldScopeContext.Provider value={scope}>
      <Outlet />
    </WorldScopeContext.Provider>
  )
}
