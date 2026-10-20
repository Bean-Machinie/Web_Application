import { createContext } from "react"
import type { Campaign } from "@/lib/campaigns"

// What belongs to the signed-in person, wherever they are in the app. The
// campaign they are looking at comes from the address; see CampaignScope.
export type CampaignState = {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
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
  loading: true,
  error: null,
  refresh: async () => {},
  unreadCount: 0,
  refreshUnread: async () => {},
  refreshKey: 0,
  respond: async () => {},
})
