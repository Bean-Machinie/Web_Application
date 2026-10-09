import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldEntry } from "@/hooks/use-world-entry"
import { useWorldFields } from "@/hooks/use-world-fields"
import { readBackTo } from "@/lib/back-link"
import { entryTrail, trailThrough } from "@/lib/breadcrumbs"
import { errorMessage } from "@/lib/campaigns"
import { deleteWorldEntry, renameWorldEntry } from "@/lib/world-entries"
import { deleteWorldImage, toWorldImage } from "@/lib/world-images"
import { COVER_FIELD } from "@/lib/world-kinds"
import { markWorldListReturn } from "@/lib/world-list-memory"
import { worldListPath } from "@/lib/world-tab"
import { ConfirmDialog } from "./ConfirmDialog"
import { MapEntryScreen } from "./MapEntryScreen"
import { useCampaign } from "./useCampaign"
import { usePageTrail } from "./usePageTrail"
import { WorldEntryPage } from "./WorldEntryPage"

// Loads an entry and picks its layout: a map fills the screen, anything else
// is a page. Render with key={entryId} so moving between entries starts from
// scratch.
export function WorldEntryView({ entryId }: { entryId: string }) {
  const navigate = useNavigate()
  // Set when this entry was opened from somewhere other than the World list.
  const from = readBackTo(useLocation().state)
  const { can, current } = useCampaign()
  const canManage = can("manage_world")
  const { entry, error, reload, setRevealed } = useWorldEntry(entryId)
  const fieldsState = useWorldFields(entryId, entry?.kind)
  // While the entry loads, the steps already known stay put and only the name
  // is filled in after, so the trail does not blink away and back.
  usePageTrail(entry ? entryTrail(entry, from) : [...trailThrough(from), { label: "…" }])
  // The World list then opens as it was left.
  useEffect(() => markWorldListReturn(), [])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteWorldEntry(entryId)
      // The file is no longer referenced; failing to remove it is harmless.
      await deleteWorldImage(
        toWorldImage(fieldsState.fields?.[COVER_FIELD]?.value)?.path,
        entry?.kind
      ).catch(() => {})
      navigate(worldListPath())
    } catch (failure) {
      setActionError(errorMessage(failure))
      setDeleting(false)
      setBusy(false)
    }
  }

  const fail = (failure: unknown) => setActionError(errorMessage(failure))

  return (
    <>
      {(error || actionError) && (
        <FormAlert tone="error">{(error || actionError)!}</FormAlert>
      )}
      <LoadingGate
        // Fills the page, so a map can fill the screen.
        className="flex min-h-0 flex-1 flex-col"
        loading={entry === undefined && !error}
        skeleton={<Skeleton className="h-8 w-56" />}
      >
        {() =>
          entry === null ? (
            <p className="text-muted-foreground text-sm">
              This entry does not exist, or has not been revealed to you.
            </p>
          ) : (
            entry && (
              <>
                {(() => {
                  const props = {
                    entryId,
                    campaignId: current!.id,
                    kind: entry.kind,
                    name: entry.name,
                    revealed: entry.revealed,
                    canManage,
                    state: fieldsState,
                    onRename: async (name: string) => {
                      try {
                        setActionError(null)
                        await renameWorldEntry(entryId, name)
                        await reload()
                      } catch (failure) {
                        fail(failure)
                      }
                    },
                    onRevealedChange: (revealed: boolean) => {
                      setActionError(null)
                      setRevealed(revealed).catch(fail)
                    },
                    onDelete: () => setDeleting(true),
                    detailsOpen,
                    onDetailsOpenChange: setDetailsOpen,
                  }
                  return entry.kind === "map" ? (
                    <MapEntryScreen {...props} />
                  ) : (
                    <WorldEntryPage {...props} />
                  )
                })()}
                <ConfirmDialog
                  open={deleting}
                  title={`Delete ${entry.name}?`}
                  description="This permanently removes the entry. It cannot be undone."
                  confirmLabel="Delete entry"
                  busy={busy}
                  error={null}
                  onCancel={() => setDeleting(false)}
                  onConfirm={handleDelete}
                />
              </>
            )
          )
        }
      </LoadingGate>
    </>
  )
}
