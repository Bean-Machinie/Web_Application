import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { SheetActions } from "./character-actions"
import { AbilityScoresForm } from "./AbilityScoresForm"

type Props = {
  actions: SheetActions
  // Which step it opens on; null while closed.
  open: 1 | 2 | null
  onClose: () => void
}

// A helper for the base ability scores and the background's increase, opened from the
// Ability scores section or from the link in the background section. The form is only
// mounted while open, so it starts fresh each time.
export function AbilityScoresDialog({ actions, open, onClose }: Props) {
  return (
    <Dialog open={open !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {open !== null && <AbilityScoresForm actions={actions} firstStep={open} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
