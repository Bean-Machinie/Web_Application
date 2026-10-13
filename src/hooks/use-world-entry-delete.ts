import { useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { deleteWorldEntry } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { deleteWorldImage } from "@/lib/world-images"

// Deleting one entry from the list: the entry being asked about, and the
// confirmed delete itself.
export function useWorldEntryDelete(
  reload: () => Promise<unknown>,
  onError: (message: string) => void
) {
  const [deleting, setDeleting] = useState<WorldEntry | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await deleteWorldEntry(deleting!.id)
      // The file is no longer referenced; failing to remove it is harmless.
      await deleteWorldImage(deleting!.imagePath, deleting!.kind).catch(() => {})
      setDeleting(null)
      await reload()
    } catch (failure) {
      onError(errorMessage(failure))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  return { deleting, setDeleting, busy, confirm }
}
