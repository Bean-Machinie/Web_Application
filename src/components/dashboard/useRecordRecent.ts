import { useEffect } from "react"
import { useAuth } from "@/auth/useAuth"
import type { Recent } from "@/lib/palette-items"
import { recordRecent } from "@/lib/recent-items"

// Remembers a page as recently opened, for the command palette. Pass null while
// it is not known yet.
export function useRecordRecent(recent: Recent | null | undefined) {
  const userId = useAuth().session?.user.id
  // Rebuilt on every render; only a change in it should count.
  const key = recent && JSON.stringify(recent)

  useEffect(() => {
    if (userId && key) recordRecent(userId, JSON.parse(key) as Recent)
  }, [userId, key])
}
