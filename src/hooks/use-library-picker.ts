import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import type { Monster } from "@/lib/compendium-monsters"
import { isSrdEntryId, srdEntry, srdMonster } from "@/lib/srd-entries"
import { copiedCount, copyNote } from "@/lib/world-copy-flow"
import type { CopyOutcome } from "@/lib/world-copy-flow"
import type { AddFromLibrary } from "@/lib/world-copy-flow"
import { fetchLibraryEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { useCopyChoice } from "./use-copy-choice"

type Options = {
  add: AddFromLibrary
  // Adds an SRD creature; those picked are added one after another, after the library's entries.
  addMonster?: (monster: Monster) => Promise<unknown>
  // How many were added, and what to say about the entries that came along.
  onAdded: (count: number, note: string) => void
  onClose: () => void
}

const NOTHING_COPIED: CopyOutcome = {
  cancelled: false,
  copiedIds: [],
  newIds: {},
  linked: 0,
  leftOut: 0,
  skipped: 0,
  pinnedOn: [],
  error: null,
}

// The library's entries, and adding some of them. When they link to entries the
// campaign does not have, it asks which to bring along first, through
// `copyDialog`. `entries` is null while they load.
export function useLibraryPicker({ add, addMonster, onAdded, onClose }: Options) {
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
      const mine = chosen.filter((entry) => !isSrdEntryId(entry.id))
      const monsters = chosen.flatMap((entry) => srdMonster(entry) ?? [])
      const outcome = mine.length > 0 ? await add(mine, ask) : NOTHING_COPIED
      // Backing out of the question leaves everything picked.
      if (outcome.cancelled) return
      // All or nothing, so what was picked stays picked, to try again.
      if (outcome.error) {
        setError(`Nothing was added. ${outcome.error}`)
        return
      }
      outcome.copiedIds.forEach(onEach)
      // They are plain copies of the SRD, so unlike the library's there is no duplicate to ask about.
      for (const monster of monsters) {
        await addMonster?.(monster)
        onEach(srdEntry(monster).id)
      }
      onAdded(copiedCount(outcome) + monsters.length, copyNote(outcome))
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setProgress(null)
    }
  }

  return { entries, loadError, progress, error, addEntries, copyDialog }
}
