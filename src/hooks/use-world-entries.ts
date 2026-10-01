import { useCallback, useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import {
  fetchWorldEntries,
  reorderWorldEntries,
  setWorldEntryRevealed,
} from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { reorderEntries } from "@/lib/world-list"

// The last list seen per campaign, so coming back shows it at once and
// refreshes quietly instead of starting from a skeleton.
const seen = new Map<string, WorldEntry[]>()

// Use with key={campaignId} so switching campaigns starts from that
// campaign's cached list.
export function useWorldEntries(campaignId: string) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(
    () => seen.get(campaignId) ?? null
  )
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    () =>
      fetchWorldEntries(campaignId)
        .then((list) => {
          seen.set(campaignId, list)
          setEntries(list)
          setError(null)
        })
        .catch((failure) => setError(errorMessage(failure))),
    [campaignId]
  )

  useEffect(() => {
    reload()
  }, [reload])

  // The switch moves at once and goes back if the database says no.
  async function setRevealed(id: string, revealed: boolean) {
    const apply = (value: boolean) =>
      setEntries((list) =>
        list && list.map((e) => (e.id === id ? { ...e, revealed: value } : e))
      )
    apply(revealed)
    try {
      await setWorldEntryRevealed(id, revealed)
    } catch (failure) {
      apply(!revealed)
      throw failure
    }
  }

  // Moves at once and goes back if the database says no. `visibleIds` is the
  // shown subset in its new order.
  async function reorder(visibleIds: string[]) {
    if (!entries) return
    const previous = entries
    const apply = (list: WorldEntry[]) => {
      seen.set(campaignId, list)
      setEntries(list)
    }
    const next = reorderEntries(previous, visibleIds)
    apply(next)
    try {
      await reorderWorldEntries(campaignId, next.map((entry) => entry.id))
    } catch (failure) {
      apply(previous)
      throw failure
    }
  }

  return { entries, error, reload, setRevealed, reorder }
}
