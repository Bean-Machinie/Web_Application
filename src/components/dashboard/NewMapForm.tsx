import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMapSize } from "@/hooks/use-map-size"
import { errorMessage } from "@/lib/campaigns"
import { createScene } from "@/lib/map-scene"
import { untitledName } from "@/lib/untitled-entry"
import { saveMapScene } from "@/lib/world-map-scenes"
import { LABEL, MapCanvasFields } from "./MapCanvasFields"
import { MapSizePreview } from "./MapSizePreview"
import { useWorldScope } from "./useWorldScope"

type Props = {
  // Builds on a map that exists (and so asks no name) instead of making one.
  mapId?: string
  onClose: () => void
}

// Only mounted while the dialog is open, so it starts fresh every time. The sea is the
// only background there is, so none is asked for.
export function NewMapForm({ mapId, onClose }: Props) {
  const navigate = useNavigate()
  const scope = useWorldScope()
  const size = useMapSize()
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (size.problem) return
    setBusy(true)
    setError(null)
    try {
      const id = mapId ?? (await scope.createEntry("map", name.trim() || untitledName("map"))).id
      await saveMapScene(id, createScene({ width: size.w, height: size.h, background: "ocean" }), null)
      onClose()
      navigate(`${scope.basePath}/${id}/build`)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogDescription className="sr-only">Choose the size of the canvas.</DialogDescription>
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex flex-col gap-4">
          {!mapId && (
            <div className="grid gap-2">
              <Label htmlFor="new-map-name" className={LABEL}>
                Name
              </Label>
              <Input
                id="new-map-name"
                autoFocus
                autoComplete="off"
                maxLength={80}
                placeholder="Untitled map"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={busy}
                className="h-9"
              />
            </div>
          )}
          <MapCanvasFields size={size} />
        </div>
        <MapSizePreview width={size.w} height={size.h} />
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <DialogFooter className="sm:items-center">
        <p className="text-muted-foreground text-xs sm:mr-auto">The size can't be changed later.</p>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || size.problem !== null}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create
        </Button>
      </DialogFooter>
    </form>
  )
}
