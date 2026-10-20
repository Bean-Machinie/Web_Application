import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { campaignScope } from "@/lib/world-scope"
import { useCurrentCampaign } from "./useCurrentCampaign"
import { WorldScopeContext } from "./WorldScopeContext"

// Gives the pages below it the current campaign's world. Only used inside
// CampaignScope, so there is always a campaign.
export function CampaignWorldScope() {
  const { current, can } = useCurrentCampaign()
  const campaignId = current.id
  const canManage = can("manage_world")
  // Stable, since the hooks that load entries start over when it changes.
  const scope = useMemo(
    () => campaignScope(campaignId, canManage),
    [campaignId, canManage]
  )

  return (
    <WorldScopeContext.Provider value={scope}>
      <Outlet />
    </WorldScopeContext.Provider>
  )
}
