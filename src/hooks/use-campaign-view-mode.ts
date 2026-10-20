import { useState } from "react"
import { useAuth } from "@/auth/useAuth"

export type CampaignViewMode = "list" | "grid"

// Remembered per user, in this browser.
export function useCampaignViewMode() {
  const storageKey = `campaigns-view:${useAuth().session!.user.id}`
  const [mode, setMode] = useState<CampaignViewMode>(() => {
    try {
      return localStorage.getItem(storageKey) === "list" ? "list" : "grid"
    } catch {
      return "grid"
    }
  })

  function change(next: CampaignViewMode) {
    setMode(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [mode, change] as const
}
