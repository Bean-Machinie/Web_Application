import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WORLD_KINDS, worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = {
  busy: boolean
  // The kind the form starts on, usually the tab the picker was on.
  initialKind: WorldEntryKind
  onCreate: (kind: WorldEntryKind, name: string) => void
}

// Create an entry on the spot; it starts hidden like any new entry.
export function MarkerNewEntry({ busy, initialKind, onCreate }: Props) {
  const [kind, setKind] = useState<WorldEntryKind>(initialKind)
  const [name, setName] = useState("")

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onCreate(kind, name.trim())
      }}
    >
      <div className="grid gap-2">
        <Label>Kind</Label>
        <Select value={kind} onValueChange={(next) => setKind(next as WorldEntryKind)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {worldKinds.map((option) => (
              <SelectItem key={option} value={option}>
                {WORLD_KINDS[option].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="marker-entry-name">Name</Label>
        <Input
          id="marker-entry-name"
          autoFocus
          autoComplete="off"
          maxLength={80}
          placeholder={WORLD_KINDS[kind].namePlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
        <p className="text-muted-foreground text-xs">
          New entries start hidden, so this marker stays hidden from players until you reveal the
          entry.
        </p>
      </div>
      <Button type="submit" disabled={busy || name.trim() === ""}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        Create and place
      </Button>
    </form>
  )
}
