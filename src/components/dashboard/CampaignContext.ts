import { createContext } from "react"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import type { Campaign } from "@/lib/campaigns"
import type { Invitation } from "@/lib/invitations"
import type { AppNotification } from "@/lib/notifications"

export type CampaignState = {
  campaigns: Campaign[]
  current: Campaign | null
  loading: boolean
  error: string | null
  select: (id: string) => void
  refresh: () => Promise<void>
  // Whether the current user may do this in the current campaign.
  can: (permission: CampaignPermission) => boolean
  // Invitations waiting for the current user to accept or decline.
  invitations: Invitation[]
  // Accepting also adds the campaign to `campaigns`.
  respond: (invitationId: string, accept: boolean) => Promise<void>
  // Things that happened, which only need reading and dismissing.
  notifications: AppNotification[]
  dismiss: (notificationId: string) => Promise<void>
}

export const CampaignContext = createContext<CampaignState>({
  campaigns: [],
  current: null,
  loading: true,
  error: null,
  select: () => {},
  refresh: async () => {},
  can: () => false,
  invitations: [],
  respond: async () => {},
  notifications: [],
  dismiss: async () => {},
})
