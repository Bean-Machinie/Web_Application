import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { errorMessage } from "@/lib/campaigns"
import { deleteStamp, renameStamp } from "@/lib/stamps/stamp-file"
import type { Stamp } from "@/lib/stamps/stamps"
import { ConfirmDialog } from "./ConfirmDialog"
import { EntryNameDialog } from "./EntryNameDialog"

// Where the menu was opened, and on which stamp.
export type StampSpot = { x: number; y: number; stamp: Stamp }

type Props = { spot: StampSpot | null; onClose: () => void }

// Development only: the right-click menu of an island in the library, to rename it or
// delete it from the stamps file.
export function MapStampMenu({ spot, onClose }: Props) {
  // What the menu led to, kept after it has closed.
  const [renaming, setRenaming] = useState<Stamp | null>(null)
  const [deleting, setDeleting] = useState<Stamp | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    if (!deleting) return
    setBusy(true)
    setError(null)
    try {
      await deleteStamp(deleting.id)
      setDeleting(null)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DropdownMenu open={spot !== null} onOpenChange={(open) => !open && onClose()}>
        <DropdownMenuTrigger asChild>
          <span aria-hidden className="pointer-events-none fixed size-px" style={{ left: spot?.x ?? 0, top: spot?.y ?? 0 }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem onSelect={() => spot && setRenaming(spot.stamp)}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => spot && setDeleting(spot.stamp)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EntryNameDialog
        open={renaming !== null}
        title="Rename stamp"
        description="The name the stamp has in the library."
        submitLabel="Rename"
        initialName={renaming?.name}
        onSubmit={async (name) => {
          if (renaming) await renameStamp(renaming.id, name)
        }}
        onClose={() => setRenaming(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this stamp?"
        description={`"${deleting?.name ?? ""}" is taken out of the project's stamps file. Land already placed with it is not changed.`}
        confirmLabel="Delete"
        busy={busy}
        error={error}
        onCancel={() => {
          setDeleting(null)
          setError(null)
        }}
        onConfirm={() => void remove()}
      />
    </>
  )
}
