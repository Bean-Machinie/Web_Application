import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { NewEntryForm } from "./NewEntryForm"

type Props = {
  campaignId: string
  kind: WorldEntryKind | null
  reload: () => Promise<unknown>
  onClose: () => void
}

export function NewEntryDialog({ kind, onClose, ...form }: Props) {
  return (
    <Dialog open={kind !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New {kind ? WORLD_KINDS[kind].label.toLowerCase() : ""}</DialogTitle>
        </DialogHeader>
        {kind && <NewEntryForm {...form} kind={kind} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
