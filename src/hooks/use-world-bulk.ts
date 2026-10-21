import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { plural } from "@/lib/entry-selection"
import { errorMessage } from "@/lib/campaigns"
import { COPY_LIMIT, copiedCount, copyEntries, copyNote } from "@/lib/world-copy-flow"
import { deleteWorldEntries, setWorldEntriesRevealed } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { deleteWorldImages } from "@/lib/world-images"
import { useCopyChoice } from "./use-copy-choice"
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
  const copyChoice = useCopyChoice()
  useNoticeTimeout(notice !== null, () => setNotice(null))

  const chosen = (entries ?? []).filter((entry) => selection.selected.has(entry.id))

  // A task that resolves to undefined was called off: nothing changes.
  async function run(label: string, task: () => Promise<BulkNotice | null | undefined>) {
    setError(null)
    setNotice(null)
    setProgress(label)
    try {
      const done = await task()
      if (done === undefined) return
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

  const saveAll = () =>
    run("Saving…", async () => {
      const userId = session?.user.id
      if (!userId) throw new Error("You must be signed in.")
      const outcome = await copyEntries(
        chosen,
        { campaignId: null, folder: userId },
        copyChoice.ask
      )
      // Backing out of the question leaves everything as it was.
      if (outcome.cancelled) return undefined
      // All or nothing, so the selection stays to try again.
      if (outcome.error) throw new Error(`Nothing was saved. ${outcome.error}`)
      const note = copyNote(outcome)
      return {
        text: `Saved ${plural(copiedCount(outcome))} to your library.${note ? ` ${note}` : ""}`,
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
    canSave: chosen.length > 0 && chosen.length <= COPY_LIMIT,
    // Why saving is not offered, when it is the size of the selection.
    saveHint:
      chosen.length > COPY_LIMIT
        ? `Pick at most ${COPY_LIMIT} entries to save at a time.`
        : null,
    copyDialog: copyChoice.dialog,
    reveal,
    remove,
    saveAll,
  }
}
