import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewCharacterForm } from "./NewCharacterForm"

// The one way to start a character: choose the system, then it opens, named
// "Untitled character", with the name ready to type over.
export function NewCharacterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New character</DialogTitle>
        </DialogHeader>
        <NewCharacterForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
