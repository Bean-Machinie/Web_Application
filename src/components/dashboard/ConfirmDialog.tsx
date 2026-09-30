import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
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
  title: string
  description: string
  confirmLabel: string
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

// A plain "are you sure?" for actions that are serious but not typed out.
export function ConfirmDialog(props: Props) {
  const { open, title, description, confirmLabel, busy, error } = props

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && props.onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <DialogFooter>
          <Button variant="outline" onClick={props.onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={props.onConfirm} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
