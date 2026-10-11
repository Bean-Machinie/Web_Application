import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { PickedLandmass } from "@/hooks/use-stamp-placement"
import { errorMessage } from "@/lib/campaigns"
import { saveStamp } from "@/lib/stamps/stamp-file"

type Props = { picked: PickedLandmass | null; onClose: () => void; onSaved: () => void }

function Form({ picked, onClose, onSaved }: { picked: PickedLandmass; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await saveStamp({ name: name.trim(), aspect: picked.aspect, polygons: picked.polygons })
      onSaved()
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogDescription>
        {picked.count > 1 ? "Their outlines, and where they lie to one another, are" : "Its outline is"} simplified and kept in the project's stamps file.
      </DialogDescription>
      {picked.touchesEdge && (
        <FormAlert tone="warning">{`${picked.count > 1 ? "A landmass here" : "This landmass"} touches the map's edge, so its outline has a straight side where it was cut off.`}</FormAlert>
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
export function MapSaveStampDialog({ picked, onClose, onSaved }: Props) {
  return (
    <Dialog open={picked !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{picked && picked.count > 1 ? `Save ${picked.count} landmasses as one stamp` : "Save landmass as stamp"}</DialogTitle>
        </DialogHeader>
        {picked && <Form picked={picked} onClose={onClose} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}
