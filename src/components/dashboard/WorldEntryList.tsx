import { useState } from "react"
import { Globe2, Pencil, Trash2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Badge } from "@/components/ui/badge"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import {
  createWorldEntry,
  deleteWorldEntry,
  renameWorldEntry,
} from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { ConfirmDialog } from "./ConfirmDialog"
import { EntryNameDialog } from "./EntryNameDialog"
import { NewEntryButton } from "./NewEntryButton"
import { useCampaign } from "./useCampaign"
import { WorldEntryTable } from "./WorldEntryTable"
import { WorldListSkeleton } from "./WorldListSkeleton"

// Render with key={campaign.id} so switching campaigns starts from scratch.
export function WorldEntryList({ campaign }: { campaign: Campaign }) {
  const { can } = useCampaign()
  const canManage = can("manage_world")
  const { entries, error, reload, setRevealed } = useWorldEntries(campaign.id)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [deleting, setDeleting] = useState<WorldEntry | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteWorldEntry(deleting!.id)
      setDeleting(null)
      await reload()
    } catch (failure) {
      setActionError(errorMessage(failure))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  const manage = canManage
    ? {
        onReveal: (entry: WorldEntry, revealed: boolean) => {
          setActionError(null)
          setRevealed(entry.id, revealed).catch((failure) =>
            setActionError(errorMessage(failure))
          )
        },
        actionsFor: (entry: WorldEntry) => [
          { label: "Rename", icon: Pencil, onSelect: () => setRenaming(entry) },
          {
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onSelect: () => setDeleting(entry),
          },
        ],
      }
    : null

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-xs">
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Entries</h3>
            {entries && <Badge variant="secondary">{entries.length}</Badge>}
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {canManage
              ? "Hidden entries are only visible to you."
              : "What your GM has revealed so far."}
          </p>
        </div>
        {canManage && <NewEntryButton onPick={setCreating} />}
      </div>

      {(error || actionError) && (
        <div className="border-t px-6 py-4">
          <FormAlert tone="error">{(error || actionError)!}</FormAlert>
        </div>
      )}
      <LoadingGate
        loading={!entries && !error}
        className="border-t"
        skeleton={<WorldListSkeleton canManage={canManage} />}
      >
        {() =>
          entries &&
          (entries.length > 0 ? (
            <WorldEntryTable entries={entries} manage={manage} />
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                <Globe2 className="size-5" />
              </span>
              <p className="text-sm font-medium">
                {canManage ? "No entries yet" : "Nothing revealed yet"}
              </p>
              <p className="text-muted-foreground max-w-xs text-sm">
                {canManage
                  ? "Create your first NPC to start building the world."
                  : "Entries your GM reveals will show up here."}
              </p>
            </div>
          ))
        }
      </LoadingGate>

      <EntryNameDialog
        open={creating !== null}
        title={`New ${creating ? WORLD_KINDS[creating].label : ""}`}
        description="Give the entry a name."
        submitLabel="Create"
        onSubmit={async (name) => {
          await createWorldEntry(campaign.id, creating!, name)
          await reload()
        }}
        onClose={() => setCreating(null)}
      />
      <EntryNameDialog
        open={renaming !== null}
        title="Rename entry"
        description="Change the entry's name."
        submitLabel="Save"
        initialName={renaming?.name}
        onSubmit={async (name) => {
          await renameWorldEntry(renaming!.id, name)
          await reload()
        }}
        onClose={() => setRenaming(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? "this entry"}?`}
        description="This permanently removes the entry. It cannot be undone."
        confirmLabel="Delete entry"
        busy={busy}
        error={null}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
