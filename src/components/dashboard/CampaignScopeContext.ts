import { createContext } from "react"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import type { Campaign } from "@/lib/campaigns"

export type CampaignScopeState = {
  current: Campaign
  // Whether the current user may do this in this campaign.
  can: (permission: CampaignPermission) => boolean
}

export const CampaignScopeContext = createContext<CampaignScopeState | null>(null)
