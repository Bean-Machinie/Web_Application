import { useCallback, useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { fetchWorldEntry, setWorldEntryRevealed } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"

const seen = new Map<string, WorldEntry>()

// `entry` is undefined while loading and null when there is no such entry or
// it is hidden from this person. Use with key={entryId}.
export function useWorldEntry(entryId: string) {
  const [entry, setEntry] = useState<WorldEntry | null | undefined>(() =>
    seen.get(entryId)
  )
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    () =>
      fetchWorldEntry(entryId)
        .then((found) => {
          if (found) seen.set(entryId, found)
          else seen.delete(entryId)
          setEntry(found)
          setError(null)
        })
        .catch((failure) => setError(errorMessage(failure))),
    [entryId]
  )

  useEffect(() => {
    reload()
  }, [reload])

  // The switch moves at once and goes back if the database says no.
  async function setRevealed(revealed: boolean) {
    const apply = (value: boolean) =>
      setEntry((old) => old && { ...old, revealed: value })
    apply(revealed)
    try {
      await setWorldEntryRevealed(entryId, revealed)
    } catch (failure) {
      apply(!revealed)
      throw failure
    }
  }

  return { entry, error, reload, setRevealed }
}
