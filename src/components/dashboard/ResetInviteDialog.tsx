import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetInviteDialog({ open, busy, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset invite link?</DialogTitle>
          <DialogDescription>
            The current link stops working straight away. Anyone who has not
            joined yet will need the new one. People already in the campaign
            are not affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Reset link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
