import { useCallback, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { errorMessage } from "@/lib/campaigns"
import { createWorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { MarkerEntryList } from "./MarkerEntryList"
import { MarkerNewEntry } from "./MarkerNewEntry"

type Props = {
  open: boolean
  campaignId: string
  mapId: string
  onClose: () => void
  // Rejects when the marker could not be placed.
  onLink: (entryId: string) => Promise<void>
}

type BodyProps = Omit<Props, "open">

// Only mounted while the dialog is open, so it starts fresh every time.
function LinkBody({ campaignId, mapId, onLink }: BodyProps) {
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const link = useCallback(
    async (prepare: () => Promise<string>) => {
      setBusy(true)
      setError(null)
      try {
        await onLink(await prepare())
      } catch (failure) {
        setError(errorMessage(failure))
        setBusy(false)
      }
    },
    [onLink]
  )

  return (
    <div className="grid gap-4">
      {creating ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-fit"
            onClick={() => setCreating(false)}
            disabled={busy}
          >
            <ArrowLeft />
            Pick an existing entry
          </Button>
          <MarkerNewEntry
            busy={busy}
            onCreate={(kind: WorldEntryKind, name: string) =>
              link(async () => (await createWorldEntry(campaignId, kind, name)).id)
            }
          />
        </>
      ) : (
        <>
          <MarkerEntryList
            campaignId={campaignId}
            exceptId={mapId}
            disabled={busy}
            onPick={(entry) => link(async () => entry.id)}
            onError={setError}
          />
          <Button variant="outline" onClick={() => setCreating(true)} disabled={busy}>
            Create a new entry instead
          </Button>
        </>
      )}
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}

export function MarkerLinkDialog({ open, onClose, ...body }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link the marker</DialogTitle>
          <DialogDescription>
            Choose the entry this marker opens. It is only shown to players once that entry is
            revealed.
          </DialogDescription>
        </DialogHeader>
        {open && <LinkBody {...body} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
