import { useState } from "react"
import type { JournalNode } from "@/lib/journal"
import { ConfirmDialog } from "./ConfirmDialog"
import { UNTITLED } from "./JournalRowTitle"

type Props = {
  // The page to delete; null while the dialog is closed.
  page: JournalNode | null
  hasChildren: boolean
  onDelete: (page: JournalNode) => Promise<boolean>
  onClose: () => void
}

export function JournalDeleteDialog({ page, hasChildren, onDelete, onClose }: Props) {
  const [busy, setBusy] = useState(false)

  async function confirm() {
    if (!page) return
    setBusy(true)
    if (await onDelete(page)) onClose()
    setBusy(false)
  }

  return (
    <ConfirmDialog
      open={!!page}
      title={`Delete “${page?.title || UNTITLED}”?`}
      description={
        hasChildren
          ? "The pages inside it are deleted too. This can't be undone."
          : "This can't be undone."
      }
      confirmLabel="Delete"
      busy={busy}
      error={null}
      onCancel={onClose}
      onConfirm={confirm}
    />
  )
}
