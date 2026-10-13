import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { plural } from "@/lib/entry-selection"
import { errorMessage } from "@/lib/campaigns"
import { isCopyable, saveToLibrary } from "@/lib/world-copy"
import { deleteWorldEntries, setWorldEntriesRevealed } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { deleteWorldImages } from "@/lib/world-images"
import type { EntrySelection } from "./use-entry-selection"
import { useNoticeTimeout } from "./use-notice-timeout"

export type BulkNotice = { text: string; libraryLink?: boolean }

type Options = {
  entries: WorldEntry[] | null
  selection: EntrySelection
  reload: () => Promise<unknown>
  // Shows what went wrong, or clears it when given null.
  setError: (message: string | null) => void
}

// The actions on the picked entries. Each one clears the selection when it is
// done and leaves a short confirmation; if it fails as a whole the selection
// stays, to try again.
export function useWorldBulk({ entries, selection, reload, setError }: Options) {
  const { session } = useAuth()
  const [progress, setProgress] = useState<string | null>(null)
  const [notice, setNotice] = useState<BulkNotice | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  useNoticeTimeout(notice !== null, () => setNotice(null))

  const chosen = (entries ?? []).filter((entry) => selection.selected.has(entry.id))

  async function run(label: string, task: () => Promise<BulkNotice | null>) {
    setError(null)
    setNotice(null)
    setProgress(label)
    try {
      const done = await task()
      selection.clear()
      await reload()
      setNotice(done)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setProgress(null)
    }
  }

  const reveal = (revealed: boolean) =>
    run(revealed ? "Revealing…" : "Hiding…", async () => {
      const changed = await setWorldEntriesRevealed(
        chosen.map((entry) => entry.id),
        revealed
      )
      return {
        text:
          changed === 0
            ? `Nothing to change: already ${revealed ? "revealed" : "hidden"}.`
            : `${revealed ? "Revealed" : "Hid"} ${plural(changed)}.`,
      }
    })

  async function remove() {
    // The bar says "Deleting…" meanwhile, and the count it was asked about
    // would be gone with the selection.
    setConfirmingDelete(false)
    await run("Deleting…", async () => {
      const removed = await deleteWorldEntries(chosen.map((entry) => entry.id))
      // The files are no longer referenced; failing to remove them is harmless.
      await deleteWorldImages(
        chosen.map((entry) => ({ path: entry.imagePath, kind: entry.kind }))
      ).catch(() => {})
      return { text: `Deleted ${plural(removed)}.` }
    })
  }

  const copyable = chosen.filter((entry) => isCopyable(entry.kind))

  const saveAll = () =>
    run("Saving…", async () => {
      const userId = session?.user.id
      if (!userId) throw new Error("You must be signed in.")
      const failed: string[] = []
      let saved = 0
      for (const [index, entry] of copyable.entries()) {
        setProgress(`Saving ${index + 1} of ${copyable.length}…`)
        try {
          await saveToLibrary(entry.id, userId)
          saved += 1
        } catch (failure) {
          failed.push(`${entry.name} (${errorMessage(failure)})`)
        }
      }
      if (failed.length > 0) setError(`Could not save ${failed.join("; ")}.`)
      const skipped = chosen.length - copyable.length
      if (saved === 0) return null
      return {
        text: `Saved ${plural(saved)} to your library.${
          skipped > 0 ? ` ${skipped} could not be copied.` : ""
        }`,
        libraryLink: true,
      }
    })

  return {
    progress,
    notice,
    confirmingDelete,
    setConfirmingDelete,
    chosen,
    // Which actions make sense for what is picked.
    canReveal: chosen.some((entry) => !entry.revealed),
    canHide: chosen.some((entry) => entry.revealed),
    canSave: copyable.length > 0,
    reveal,
    remove,
    saveAll,
  }
}
