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
  // How many notifications have not been read yet. Drives every badge.
  unreadCount: number
  refreshUnread: () => Promise<void>
  // Goes up on every refresh, so open notification lists know to reload.
  refreshKey: number
  // Accepting also adds the campaign to `campaigns`.
  respond: (invitationId: string, accept: boolean) => Promise<void>
}

export const CampaignContext = createContext<CampaignState>({
  campaigns: [],
  current: null,
  loading: true,
  error: null,
  select: () => {},
  refresh: async () => {},
  can: () => false,
  unreadCount: 0,
  refreshUnread: async () => {},
  refreshKey: 0,
  respond: async () => {},
})
