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
import { fetchMyInvitations, respondToInvitation } from "@/lib/invitations"
import type { Invitation } from "@/lib/invitations"
import { dismissNotification, fetchNotifications } from "@/lib/notifications"
import type { AppNotification } from "@/lib/notifications"
import { CampaignContext } from "./CampaignContext"

// How often to look for new invitations and notifications.
const REFRESH_EVERY_MS = 60_000

export function CampaignProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().session?.user.id
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [currentId, setCurrentId] = useState(readCurrentCampaignId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    () =>
      Promise.all([
        fetchCampaigns(userId!),
        fetchMyInvitations(),
        fetchNotifications(),
      ])
        .then(([list, pending, notes]) => {
          setCampaigns(list)
          setInvitations(pending)
          setNotifications(notes)
          setError(null)
        })
        .catch((failure) => setError(errorMessage(failure)))
        .finally(() => setLoading(false)),
    [userId]
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

  async function dismiss(notificationId: string) {
    await dismissNotification(notificationId)
    setNotifications((list) => list.filter((n) => n.id !== notificationId))
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
        notifications,
        dismiss,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}
