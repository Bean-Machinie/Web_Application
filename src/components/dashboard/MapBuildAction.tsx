import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Hammer, Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { errorMessage } from "@/lib/campaigns"
import { createScene } from "@/lib/map-scene"
import { saveMapScene } from "@/lib/world-map-scenes"
import { MapBuilderLink } from "./MapBuilderLink"
import { DEFAULT_MAP_CHOICE, NewMapOptions } from "./NewMapOptions"

// For a map with no image: open it in the builder if it was built there, or
// offer to build it instead of uploading, after choosing the canvas.
export function MapBuildAction({ mapId, built }: { mapId: string; built: boolean }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState(DEFAULT_MAP_CHOICE)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (built) return <MapBuilderLink mapId={mapId} />

  async function build() {
    setBusy(true)
    setError(null)
    try {
      await saveMapScene(mapId, createScene(choice), null)
      navigate(`/app/world/${mapId}/build`)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit">
          <Hammer />
          Build instead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Build this map</DialogTitle>
          <DialogDescription>
            Draw it on a canvas instead of uploading an image. The canvas size cannot change
            later.
          </DialogDescription>
        </DialogHeader>
        <NewMapOptions value={choice} onChange={setChoice} askSource={false} />
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={build} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Open the builder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
