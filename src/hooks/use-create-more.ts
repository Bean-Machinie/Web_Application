import { useState } from "react"
import { useAuth } from "@/auth/useAuth"

// The "Create more" toggle, remembered per user in this browser.
export function useCreateMore() {
  const storageKey = `create-more:${useAuth().session!.user.id}`
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1"
    } catch {
      return false
    }
  })

  function change(next: boolean) {
    setOn(next)
    try {
      localStorage.setItem(storageKey, next ? "1" : "0")
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [on, change] as const
}
