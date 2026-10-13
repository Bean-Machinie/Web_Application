import { useEffect, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { errorMessage } from "@/lib/campaigns"
import { saveToLibrary } from "@/lib/world-copy"

const NOTICE_MS = 6000

// Saving to the library, with what the page needs to say about it: whether it
// is under way, the name of what was just saved, or what went wrong.
export function useSaveToLibrary() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The bar floats over the page, so it goes away by itself.
  useEffect(() => {
    if (!savedName) return
    const timer = window.setTimeout(() => setSavedName(null), NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [savedName])

  async function save(entry: { id: string; name: string }) {
    const userId = session?.user.id
    if (!userId || busy) return
    setBusy(true)
    setSavedName(null)
    setError(null)
    try {
      await saveToLibrary(entry.id, userId)
      setSavedName(entry.name)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return { save, busy, savedName, error }
}
