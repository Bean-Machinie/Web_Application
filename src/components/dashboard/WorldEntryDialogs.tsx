import { renameWorldEntry } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { ConfirmDialog } from "./ConfirmDialog"
import { EntryNameDialog } from "./EntryNameDialog"
import { NewEntryDialog } from "./NewEntryDialog"

type Props = {
  campaignId: string
  creating: WorldEntryKind | null
  renaming: WorldEntry | null
  deleting: WorldEntry | null
  busy: boolean
  reload: () => Promise<unknown>
  onDelete: () => void
  onCloseCreate: () => void
  onCloseRename: () => void
  onCloseDelete: () => void
}

export function WorldEntryDialogs(props: Props) {
  const { campaignId, creating, renaming, deleting, busy, reload } = props

  return (
    <>
      <NewEntryDialog
        campaignId={campaignId}
        kind={creating}
        reload={reload}
        onClose={props.onCloseCreate}
      />
      <EntryNameDialog
        open={renaming !== null}
        title="Rename entry"
        description="Change the entry's name."
        submitLabel="Save"
        initialName={renaming?.name}
        onSubmit={async (name) => {
          await renameWorldEntry(renaming!.id, name)
          await reload()
        }}
        onClose={props.onCloseRename}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? "this entry"}?`}
        description="This permanently removes the entry. It cannot be undone."
        confirmLabel="Delete entry"
        busy={busy}
        error={null}
        onCancel={props.onCloseDelete}
        onConfirm={props.onDelete}
      />
    </>
  )
}
