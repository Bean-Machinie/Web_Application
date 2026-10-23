import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewMapForm } from "./NewMapForm"

type Props = {
  open: boolean
  onClose: () => void
  // Builds on this map, which has no scene yet, instead of making a new one.
  mapId?: string
}

// The one way to start a map: a name (when there is no map yet) and a size, in the place
// the World components are looking at (a campaign's world, or your library), then the
// map builder opens on it.
export function NewMapDialog({ open, onClose, mapId }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{mapId ? "Build this map" : "New map"}</DialogTitle>
        </DialogHeader>
        <NewMapForm mapId={mapId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
