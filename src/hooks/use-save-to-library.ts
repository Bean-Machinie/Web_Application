import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { errorMessage } from "@/lib/campaigns"
import { PINS_NOT_SAVED, saveToLibrary } from "@/lib/world-copy"
import { useNoticeTimeout } from "./use-notice-timeout"

// Saving to the library, with what the page needs to say about it: whether it
// is under way, the name of what was just saved, or what went wrong.
export function useSaveToLibrary() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useNoticeTimeout(savedName !== null, () => setSavedName(null))

  async function save(entry: { id: string; name: string }) {
    const userId = session?.user.id
    if (!userId || busy) return
    setBusy(true)
    setSavedName(null)
    setError(null)
    try {
      const { pinsDropped } = await saveToLibrary(entry.id, userId)
      setNote(pinsDropped ? PINS_NOT_SAVED : null)
      setSavedName(entry.name)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return { save, busy, savedName, note, error }
}
