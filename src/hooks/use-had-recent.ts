import { useCallback, useState } from "react"
import { useAuth } from "@/auth/useAuth"

// Whether Recent had anything last time, remembered per user in this browser. Home uses
// it to decide before loading whether to make room for Recent, so the campaigns do not
// shift. Assumed yes until known: most people have something there.
export function useHadRecent() {
  const storageKey = `recent-had:${useAuth().session!.user.id}`
  const [had, setHad] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "no"
    } catch {
      return true
    }
  })

  const remember = useCallback(
    (next: boolean) => {
      setHad(next)
      try {
        localStorage.setItem(storageKey, next ? "yes" : "no")
      } catch {
        // It just will not be remembered.
      }
    },
    [storageKey]
  )

  return [had, remember] as const
}
