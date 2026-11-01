import { GuestConversion } from "@/components/auth/GuestConversion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = { open: boolean; action?: string; onClose: () => void }

// Asks a guest to make an account, from the menu or from a feature that needs one.
export function AccountRequiredDialog({ open, action, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {action ? `Create a free account to ${action}` : "Create a free account"}
          </DialogTitle>
          <DialogDescription>Everything you&apos;ve made so far comes with you.</DialogDescription>
        </DialogHeader>
        <GuestConversion />
      </DialogContent>
    </Dialog>
  )
}
