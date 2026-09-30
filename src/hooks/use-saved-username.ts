import { useEffect, useState } from "react"
import { fetchMyUsername } from "@/lib/username"

// The signed-in user's saved username, or null while it is loading.
export function useSavedUsername(userId: string) {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    fetchMyUsername(userId)
      .then(setUsername)
      .catch(() => setUsername(""))
  }, [userId])

  return [username, setUsername] as const
}
