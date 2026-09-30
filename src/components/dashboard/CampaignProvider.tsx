import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { can as roleCan } from "@/lib/campaign-permissions"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import { errorMessage, fetchCampaigns } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { CampaignContext } from "./CampaignContext"

const STORAGE_KEY = "current_campaign"

function readSavedId() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().session?.user.id
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentId, setCurrentId] = useState(readSavedId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    () =>
      fetchCampaigns(userId!)
        .then((list) => {
          setCampaigns(list)
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
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Remembering the choice is a convenience only.
    }
  }

  const current = campaigns.find((c) => c.id === currentId) ?? campaigns[0] ?? null
  const can = (permission: CampaignPermission) =>
    current !== null && roleCan(current.role, permission)

  return (
    <CampaignContext.Provider
      value={{ campaigns, current, loading, error, select, refresh, can }}
    >
      {children}
    </CampaignContext.Provider>
  )
}
