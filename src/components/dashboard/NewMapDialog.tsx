import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewMapForm } from "./NewMapForm"

type Props = { open: boolean; onClose: () => void }

// The one way to start a map: a name and a canvas, made in the place the World components
// are looking at (a campaign's world, or your library), then opened in the map builder.
export function NewMapDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New map</DialogTitle>
        </DialogHeader>
        <NewMapForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
