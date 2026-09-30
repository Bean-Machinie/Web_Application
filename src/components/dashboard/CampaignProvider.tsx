import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { can as roleCan } from "@/lib/campaign-permissions"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import { errorMessage, fetchCampaigns } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import {
  readCurrentCampaignId,
  saveCurrentCampaignId,
} from "@/lib/current-campaign"
import { respondToInvitation } from "@/lib/invitations"
import { fetchUnreadCount } from "@/lib/notifications"
import { CampaignContext } from "./CampaignContext"

// How often to look for new campaigns and notifications.
const REFRESH_EVERY_MS = 60_000

export function CampaignProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().session?.user.id
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentId, setCurrentId] = useState(readCurrentCampaignId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    () =>
      Promise.all([fetchCampaigns(userId!), fetchUnreadCount()])
        .then(([list, unread]) => {
          setCampaigns(list)
          setUnreadCount(unread)
          setRefreshKey((key) => key + 1)
          setError(null)
        })
        .catch((failure) => setError(errorMessage(failure)))
        .finally(() => setLoading(false)),
    [userId]
  )

  const refreshUnread = useCallback(
    () => fetchUnreadCount().then(setUnreadCount, () => {}),
    []
  )

  useEffect(() => {
    if (!userId) return
    refresh()

    // Pick up things that happened elsewhere: on a timer, and whenever the
    // tab comes back into view.
    const timer = setInterval(refresh, REFRESH_EVERY_MS)
    const onVisible = () => document.visibilityState === "visible" && refresh()
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
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
        unreadCount,
        refreshUnread,
        refreshKey,
        respond,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}
