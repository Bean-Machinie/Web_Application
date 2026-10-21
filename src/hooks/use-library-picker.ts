import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { copiedCount, copyNote } from "@/lib/world-copy-flow"
import type { AddFromLibrary } from "@/lib/world-copy-flow"
import { fetchLibraryEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { useCopyChoice } from "./use-copy-choice"

type Options = {
  add: AddFromLibrary
  // How many were added, and what to say about the entries that came along.
  onAdded: (count: number, note: string) => void
  onClose: () => void
}

// The library's entries, and adding some of them. When they link to entries the
// campaign does not have, it asks which to bring along first, through
// `copyDialog`. `entries` is null while they load.
export function useLibraryPicker({ add, onAdded, onClose }: Options) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Says where the adding has got to; null when nothing is being added.
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { ask, dialog: copyDialog } = useCopyChoice()

  useEffect(() => {
    fetchLibraryEntries()
      .then(setEntries)
      .catch((failure) => setLoadError(errorMessage(failure)))
  }, [])

  // `onEach` hears of every entry as it is added, so the page can let go of it.
  async function addEntries(chosen: WorldEntry[], onEach: (id: string) => void) {
    setError(null)
    setProgress("Adding…")
    try {
      const outcome = await add(chosen, ask)
      // Backing out of the question leaves everything picked.
      if (outcome.cancelled) return
      // All or nothing, so what was picked stays picked, to try again.
      if (outcome.error) {
        setError(`Nothing was added. ${outcome.error}`)
        return
      }
      outcome.copiedIds.forEach(onEach)
      onAdded(copiedCount(outcome), copyNote(outcome))
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setProgress(null)
    }
  }

  return { entries, loadError, progress, error, addEntries, copyDialog }
}
