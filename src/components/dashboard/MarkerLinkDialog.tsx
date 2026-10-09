import { useCallback, useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { usePhoneScreen } from "@/hooks/use-phone-screen"
import { errorMessage } from "@/lib/campaigns"
import { createWorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { MarkerEntryPicker } from "./MarkerEntryPicker"
import { MarkerNewEntry } from "./MarkerNewEntry"

type Props = {
  open: boolean
  campaignId: string
  mapId: string
  onClose: () => void
  // Rejects when the marker could not be placed.
  onLink: (entryId: string) => Promise<void>
}

type BodyProps = Omit<Props, "open" | "onClose"> & {
  // On a phone: filling a sheet, and with room for fingers.
  compact?: boolean
}

// Only mounted while the dialog is open, so it starts fresh every time.
function LinkBody({ campaignId, mapId, onLink, compact }: BodyProps) {
  // Set while making a new entry instead of picking one; the kind it opens on.
  const [creating, setCreating] = useState<{ kind: WorldEntryKind } | null>(null)
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
    <div className={compact ? "flex min-h-0 min-w-0 flex-1 flex-col gap-3" : "grid min-w-0 gap-4"}>
      {creating ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground pointer-coarse:h-11 w-fit"
            onClick={() => setCreating(null)}
            disabled={busy}
          >
            <ArrowLeft />
            Pick an existing entry
          </Button>
          <MarkerNewEntry
            busy={busy}
            initialKind={creating.kind}
            onCreate={(kind: WorldEntryKind, name: string) =>
              link(async () => (await createWorldEntry(campaignId, kind, name)).id)
            }
          />
        </>
      ) : (
        <MarkerEntryPicker
          campaignId={campaignId}
          exceptId={mapId}
          disabled={busy}
          compact={compact}
          onPick={(entry) => link(async () => entry.id)}
          onCreate={(kind) => setCreating({ kind: kind ?? "location" })}
        />
      )}
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}

// A dialog on a larger screen; on a phone a sheet over the whole screen, with the entries
// to scroll with a thumb.
export function MarkerLinkDialog({ open, onClose, ...body }: Props) {
  const phone = usePhoneScreen()
  if (phone) {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent side="bottom" showCloseButton={false} className="gap-0 rounded-none p-0 data-[side=bottom]:h-dvh data-[side=bottom]:border-t-0">
          <SheetHeader className="flex h-12 shrink-0 flex-row items-center justify-between border-b py-0 pr-1 pl-4">
            <SheetTitle className="text-sm font-semibold">Link the marker</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" aria-label="Close" className="size-11">
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">Choose what the marker opens</SheetDescription>
          <div className="flex min-h-0 flex-1 flex-col p-3">{open && <LinkBody {...body} compact />}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Link the marker</DialogTitle>
          <DialogDescription className="sr-only">Choose what the marker opens</DialogDescription>
        </DialogHeader>
        {open && <LinkBody {...body} />}
      </DialogContent>
    </Dialog>
  )
}
