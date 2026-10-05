import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateMore } from "@/hooks/use-create-more"
import { errorMessage } from "@/lib/campaigns"
import { createScene } from "@/lib/map-scene"
import { createWorldEntry } from "@/lib/world-entries"
import { saveMapScene } from "@/lib/world-map-scenes"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { DEFAULT_MAP_CHOICE, NewMapOptions } from "./NewMapOptions"

type Props = {
  campaignId: string
  kind: WorldEntryKind
  reload: () => Promise<unknown>
  onClose: () => void
}

// Only mounted while the dialog is open, so it starts fresh every time.
export function NewEntryForm({ campaignId, kind, reload, onClose }: Props) {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [map, setMap] = useState(DEFAULT_MAP_CHOICE)
  const [more, setMore] = useCreateMore()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const entry = await createWorldEntry(campaignId, kind, name.trim())
      if (kind === "map" && map.source === "build") {
        await saveMapScene(entry.id, createScene(map), null)
        onClose()
        navigate(`/app/world/${entry.id}/build`)
        return
      }
      if (more) {
        await reload()
        setName("")
        setBusy(false)
        input.current?.focus()
        return
      }
      onClose()
      navigate(`/app/world/${entry.id}`)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogDescription className="sr-only">Give the entry a name.</DialogDescription>
      <div className="grid gap-2">
        <Label htmlFor="new-entry-name">Name</Label>
        <Input
          id="new-entry-name"
          ref={input}
          autoFocus
          autoComplete="off"
          maxLength={80}
          placeholder={WORLD_KINDS[kind].namePlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
        <p className="text-muted-foreground text-xs">
          New entries start hidden. Reveal them to your players when you are ready.
        </p>
      </div>
      {kind === "map" && <NewMapOptions value={map} onChange={setMap} />}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <DialogFooter className="sm:items-center sm:justify-between">
        <Label className="text-muted-foreground cursor-pointer text-sm font-normal">
          <Switch size="sm" checked={more} onCheckedChange={setMore} />
          Create more
        </Label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || name.trim() === ""}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Create
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
