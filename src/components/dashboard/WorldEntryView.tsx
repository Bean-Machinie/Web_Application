import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldEntry } from "@/hooks/use-world-entry"
import { useWorldFields } from "@/hooks/use-world-fields"
import { errorMessage } from "@/lib/campaigns"
import { deleteWorldEntry, renameWorldEntry } from "@/lib/world-entries"
import { deleteWorldImage, toWorldImage } from "@/lib/world-images"
import { COVER_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import { ConfirmDialog } from "./ConfirmDialog"
import { SettingsSection } from "./SettingsSection"
import { useCampaign } from "./useCampaign"
import { VisibilitySwitch } from "./VisibilitySwitch"
import { WorldEntryHeader } from "./WorldEntryHeader"
import { WorldFields } from "./WorldFields"

// Render with key={entryId} so moving between entries starts from scratch.
export function WorldEntryView({ entryId }: { entryId: string }) {
  const navigate = useNavigate()
  const { can, current } = useCampaign()
  const campaignId = current!.id
  const canManage = can("manage_world")
  const { entry, error, reload, setRevealed } = useWorldEntry(entryId)
  const fieldsState = useWorldFields(entryId, entry?.kind)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteWorldEntry(entryId)
      // The file is no longer referenced; failing to remove it is harmless.
      await deleteWorldImage(
        toWorldImage(fieldsState.fields?.[COVER_FIELD]?.value)?.path
      ).catch(() => {})
      navigate("/app/world")
    } catch (failure) {
      setActionError(errorMessage(failure))
      setDeleting(false)
      setBusy(false)
    }
  }

  const kind = entry ? WORLD_KINDS[entry.kind] : null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <Link
        to="/app/world"
        className="text-muted-foreground hover:text-foreground mb-4 flex w-fit items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        World
      </Link>

      {error && <FormAlert tone="error">{error}</FormAlert>}
      <LoadingGate
        loading={entry === undefined && !error}
        skeleton={<Skeleton className="h-8 w-56" />}
      >
        {() =>
          entry === null ? (
            <p className="text-muted-foreground text-sm">
              This entry does not exist, or has not been revealed to you.
            </p>
          ) : (
            entry && kind && (
              <>
                <WorldEntryHeader
                  entryId={entryId}
                  campaignId={campaignId}
                  kind={entry.kind}
                  name={entry.name}
                  canManage={canManage}
                  state={fieldsState}
                  onRename={async (name) => {
                    try {
                      setActionError(null)
                      await renameWorldEntry(entryId, name)
                      await reload()
                    } catch (failure) {
                      setActionError(errorMessage(failure))
                    }
                  }}
                />

                <WorldFields
                  entryId={entryId}
                  campaignId={campaignId}
                  kind={entry.kind}
                  canManage={canManage}
                  state={fieldsState}
                />

                {canManage && (
                  <div className="divide-y border-t">
                    <SettingsSection
                      title="Visibility"
                      description="Hidden entries are only visible to you. Revealed entries are visible to every player."
                    >
                      <VisibilitySwitch
                        revealed={entry.revealed}
                        name={entry.name}
                        onChange={(value) => {
                          setActionError(null)
                          setRevealed(value).catch((failure) =>
                            setActionError(errorMessage(failure))
                          )
                        }}
                      />
                    </SettingsSection>
                    <SettingsSection
                      title="Delete entry"
                      description="Permanently remove this entry. This cannot be undone."
                    >
                      <Button variant="destructive" onClick={() => setDeleting(true)}>
                        Delete entry
                      </Button>
                    </SettingsSection>
                  </div>
                )}
                {actionError && <FormAlert tone="error">{actionError}</FormAlert>}

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
    </div>
  )
}
