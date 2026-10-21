import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { copiedCount, copyNote } from "@/lib/world-copy-flow"
import type { AddFromLibrary } from "@/lib/world-copy-flow"
import { fetchLibraryEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { useCopyChoice } from "./use-copy-choice"

type Options = {
  add: AddFromLibrary
  // How many were added, as soon as there are any, even if some fail, and what
  // to say about their pins.
  onAdded: (count: number, note: string) => void
  onClose: () => void
}

// The library's entries, and adding some of them. A map with pins asks what to
// do with them first, through `copyDialog`. `entries` is null while they load.
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
      const outcome = await add(chosen, ask, (done, total) =>
        setProgress(`Adding ${done + 1} of ${total}…`)
      )
      // Backing out of the pins question leaves everything picked.
      if (outcome.cancelled) return
      outcome.copiedIds.forEach(onEach)
      const count = copiedCount(outcome)
      if (count > 0) onAdded(count, copyNote(outcome))
      if (outcome.failed.length === 0) {
        onClose()
        return
      }
      // What was added stays added; what failed stays picked, to try again.
      setError(
        `Could not add ${outcome.failed.map((one) => `${one.name} (${one.message})`).join("; ")}.`
      )
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setProgress(null)
    }
  }

  return { entries, loadError, progress, error, addEntries, copyDialog }
}
