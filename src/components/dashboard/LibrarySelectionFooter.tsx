import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { useWorldBulk } from "@/hooks/use-world-bulk"
import { plural } from "@/lib/entry-selection"
import { ConfirmDialog } from "./ConfirmDialog"

type Props = {
  selection: EntrySelection
  bulk: ReturnType<typeof useWorldBulk>
}

// Under the library's entries while some are picked: how many, and the actions. The
// library has only one, Delete, because it has no visibility and nothing to save
// to. After one is done it says what happened in the same place. It lives in the
// window, not floating over the page: a floating bar would be under the dialog.
export function LibrarySelectionFooter({ selection, bulk }: Props) {
  const busy = bulk.progress !== null

  if (!selection.active && !bulk.notice) return null

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3">
      <span className="text-muted-foreground text-sm">
        {bulk.progress ?? (selection.active ? `${selection.count} selected` : bulk.notice?.text)}
      </span>
      {selection.active && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={selection.clear} disabled={busy}>
            Clear
          </Button>
          <Button
            variant="destructive"
            onClick={() => bulk.setConfirmingDelete(true)}
            disabled={busy}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={bulk.confirmingDelete}
        title={`Delete ${plural(bulk.chosen.length)}?`}
        description="This permanently removes them from your library. It cannot be undone."
        confirmLabel={`Delete ${plural(bulk.chosen.length)}`}
        busy={busy}
        error={null}
        onCancel={() => bulk.setConfirmingDelete(false)}
        onConfirm={bulk.remove}
      />
    </div>
  )
}
