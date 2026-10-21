import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { errorMessage } from "@/lib/campaigns"
import { copyEntries, copyNote } from "@/lib/world-copy-flow"
import type { CopyItem } from "@/lib/world-copy-flow"
import { useCopyChoice } from "./use-copy-choice"
import { useNoticeTimeout } from "./use-notice-timeout"

// Saving to the library, with what the page needs to say about it: whether it
// is under way, the name of what was just saved, or what went wrong. An entry that
// links to others the library does not have asks which to bring along first,
// through `dialog`.
export function useSaveToLibrary() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { ask, dialog } = useCopyChoice()

  useNoticeTimeout(savedName !== null, () => setSavedName(null))

  async function save(entry: CopyItem) {
    const userId = session?.user.id
    if (!userId || busy) return
    setBusy(true)
    setSavedName(null)
    setError(null)
    try {
      const outcome = await copyEntries([entry], { campaignId: null, folder: userId }, ask)
      if (outcome.cancelled) return
      if (outcome.error) throw new Error(outcome.error)
      setNote(copyNote(outcome))
      setSavedName(entry.name)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return { save, busy, savedName, note, error, dialog }
}
