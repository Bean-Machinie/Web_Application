import { createContext } from "react"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import type { Campaign } from "@/lib/campaigns"

export type CampaignState = {
  campaigns: Campaign[]
  current: Campaign | null
  loading: boolean
  error: string | null
  select: (id: string) => void
  refresh: () => Promise<void>
  // Whether the current user may do this in the current campaign.
  can: (permission: CampaignPermission) => boolean
}

export const CampaignContext = createContext<CampaignState>({
  campaigns: [],
  current: null,
  loading: true,
  error: null,
  select: () => {},
  refresh: async () => {},
  can: () => false,
})
