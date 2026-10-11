import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { PickedLandmass } from "@/hooks/use-stamp-placement"
import { errorMessage } from "@/lib/campaigns"
import { saveStamp } from "@/lib/stamps/stamp-file"

type Props = { picked: PickedLandmass | null; onClose: () => void }

function Form({ picked, onClose }: { picked: PickedLandmass; onClose: () => void }) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await saveStamp({ name: name.trim(), aspect: picked.aspect, rings: picked.rings })
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogDescription>Its outline is simplified and kept in the project's stamps file.</DialogDescription>
      {picked.touchesEdge && (
        <FormAlert tone="warning">
          This landmass touches the map's edge, so its outline has a straight side where it was cut off.
        </FormAlert>
      )}
      <Input aria-label="Name" autoFocus autoComplete="off" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} disabled={busy} />
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || name.trim() === ""}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {picked.touchesEdge ? "Save anyway" : "Save stamp"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Development only: names a landmass that was picked, and keeps it as a stamp.
export function MapSaveStampDialog({ picked, onClose }: Props) {
  return (
    <Dialog open={picked !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save landmass as stamp</DialogTitle>
        </DialogHeader>
        {picked && <Form picked={picked} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
