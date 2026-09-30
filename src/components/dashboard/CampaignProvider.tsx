import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { can as roleCan } from "@/lib/campaign-permissions"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import { errorMessage, fetchCampaigns } from "@/lib/campaigns"
import {
  readCurrentCampaignId,
  saveCurrentCampaignId,
} from "@/lib/current-campaign"
import type { Campaign } from "@/lib/campaigns"
import { fetchMyInvitations, respondToInvitation } from "@/lib/invitations"
import type { Invitation } from "@/lib/invitations"
import { CampaignContext } from "./CampaignContext"

export function CampaignProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().session?.user.id
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [currentId, setCurrentId] = useState(readCurrentCampaignId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    () =>
      Promise.all([fetchCampaigns(userId!), fetchMyInvitations()])
        .then(([list, pending]) => {
          setCampaigns(list)
          setInvitations(pending)
          setError(null)
        })
        .catch((failure) => setError(errorMessage(failure)))
        .finally(() => setLoading(false)),
    [userId]
  )

  useEffect(() => {
    if (userId) refresh()
  }, [userId, refresh])

  function select(id: string) {
    setCurrentId(id)
    saveCurrentCampaignId(id)
  }

  async function respond(invitationId: string, accept: boolean) {
    await respondToInvitation(invitationId, accept)
    await refresh()
  }

  const current = campaigns.find((c) => c.id === currentId) ?? campaigns[0] ?? null
  const can = (permission: CampaignPermission) =>
    current !== null && roleCan(current.role, permission)

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        current,
        loading,
        error,
        select,
        refresh,
        can,
        invitations,
        respond,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}
