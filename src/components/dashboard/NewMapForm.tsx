import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/campaigns"
import { createScene } from "@/lib/map-scene"
import type { CanvasChoice } from "@/lib/map-scene"
import { saveMapScene } from "@/lib/world-map-scenes"
import { MapBackgroundChoice } from "./MapBackgroundChoice"
import { MapShapeChoice } from "./MapShapeChoice"
import { useWorldScope } from "./useWorldScope"

const FIRST_CANVAS: CanvasChoice = { preset: "3:2", background: "ocean" }

// Only mounted while the dialog is open, so it starts fresh every time.
export function NewMapForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const scope = useWorldScope()
  const [name, setName] = useState("")
  const [canvas, setCanvas] = useState(FIRST_CANVAS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const map = await scope.createEntry("map", name.trim())
      await saveMapScene(map.id, createScene(canvas), null)
      onClose()
      navigate(`${scope.basePath}/${map.id}/build`)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <DialogDescription className="sr-only">
        Name the map and choose its canvas. The canvas shape cannot change later.
      </DialogDescription>
      <div className="grid gap-2">
        <Label htmlFor="new-map-name">Name</Label>
        <Input
          id="new-map-name"
          autoFocus
          autoComplete="off"
          maxLength={80}
          placeholder="The Sword Coast"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
      </div>
      <div className="grid gap-2">
        <Label>Canvas shape</Label>
        <MapShapeChoice value={canvas.preset} onChange={(preset) => setCanvas({ ...canvas, preset })} />
        <p className="text-muted-foreground text-xs">The shape cannot be changed later.</p>
      </div>
      <div className="grid gap-2">
        <Label>Background</Label>
        <MapBackgroundChoice value={canvas.background} onChange={(background) => setCanvas({ ...canvas, background })} />
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || name.trim() === ""}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create
        </Button>
      </DialogFooter>
    </form>
  )
}
