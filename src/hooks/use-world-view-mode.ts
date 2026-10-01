import { useState } from "react"
import { useAuth } from "@/auth/useAuth"

export type WorldViewMode = "list" | "grid"

// Remembered per user, in this browser.
export function useWorldViewMode() {
  const storageKey = `world-view:${useAuth().session!.user.id}`
  const [mode, setMode] = useState<WorldViewMode>(() => {
    try {
      return localStorage.getItem(storageKey) === "grid" ? "grid" : "list"
    } catch {
      return "list"
    }
  })

  function change(next: WorldViewMode) {
    setMode(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [mode, change] as const
}
