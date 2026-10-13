import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { fetchLibraryEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"

type Options = {
  add: (entryId: string) => Promise<void>
  // How many were added, as soon as there are any, even if a later one fails.
  onAdded: (count: number) => void
  onClose: () => void
}

// The library's entries, and adding some of them one after another.
// `entries` is null while they load.
export function useLibraryPicker({ add, onAdded, onClose }: Options) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Says where the adding has got to; null when nothing is being added.
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLibraryEntries()
      .then(setEntries)
      .catch((failure) => setLoadError(errorMessage(failure)))
  }, [])

  // `onEach` hears of every entry as it is added, so the page can let go of it.
  async function addEntries(chosen: WorldEntry[], onEach: (id: string) => void) {
    setError(null)
    let added = 0
    try {
      for (const entry of chosen) {
        setProgress(`Adding ${added + 1} of ${chosen.length}…`)
        try {
          await add(entry.id)
        } catch (failure) {
          throw new Error(`${entry.name}: ${errorMessage(failure)}`)
        }
        added += 1
        onEach(entry.id)
      }
      onAdded(added)
      onClose()
    } catch (failure) {
      // What was added stays added; what is left stays picked, to try again.
      setError(errorMessage(failure))
      if (added > 0) onAdded(added)
    } finally {
      setProgress(null)
    }
  }

  return { entries, loadError, progress, error, addEntries }
}
