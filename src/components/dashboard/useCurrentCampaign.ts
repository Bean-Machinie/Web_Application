import { useContext } from "react"
import { useMatch } from "react-router-dom"
import { CampaignScopeContext } from "./CampaignScopeContext"
import { useCampaign } from "./useCampaign"

// The campaign in the address. Only valid below CampaignScope.
export function useCurrentCampaign() {
  const scope = useContext(CampaignScopeContext)
  if (!scope) throw new Error("useCurrentCampaign needs a CampaignScope above it")

  return scope
}

// For the sidebar and header, which sit above CampaignScope: the campaign the
// address points at, if it is one the person belongs to.
export function useRouteCampaign() {
  const { campaigns } = useCampaign()
  const id = useMatch("/app/c/:campaignId/*")?.params.campaignId

  return campaigns.find((campaign) => campaign.id === id) ?? null
}
