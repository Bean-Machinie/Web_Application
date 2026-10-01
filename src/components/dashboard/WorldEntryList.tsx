import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { deleteWorldEntry } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import type { VisibilityFilter } from "@/lib/world-list"
import { useCampaign } from "./useCampaign"
import { WorldEmptyState } from "./WorldEmptyState"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { WorldEntryTable } from "./WorldEntryTable"
import { WorldListSkeleton } from "./WorldListSkeleton"
import { WorldTabs } from "./WorldTabs"
import { WorldToolbar } from "./WorldToolbar"

// Render with key={campaign.id} so switching campaigns starts from scratch.
export function WorldEntryList({ campaign }: { campaign: Campaign }) {
  const { can } = useCampaign()
  const canManage = can("manage_world")
  const { entries, error, reload, setRevealed } = useWorldEntries(campaign.id)
  const [params] = useSearchParams()
  const [query, setQuery] = useState("")
  const [visibility, setVisibility] = useState<VisibilityFilter>("all")
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [deleting, setDeleting] = useState<WorldEntry | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // An unknown ?kind= falls back to All.
  const kind = worldKinds.find((option) => option === params.get("kind")) ?? null
  const shown = entries && viewEntries(entries, { kind, query, visibility })

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
    <div className="flex flex-col gap-4">
      <WorldTabs entries={entries} active={kind} />
      <div className="bg-card overflow-hidden rounded-xl border shadow-xs">
        <WorldToolbar
          kind={kind}
          query={query}
          onQuery={setQuery}
          visibility={canManage ? visibility : null}
          onVisibility={setVisibility}
          onCreate={canManage ? setCreating : null}
        />

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
            shown &&
            (shown.length > 0 ? (
              <div className="border-t">
                <WorldEntryTable entries={shown} manage={manage} />
              </div>
            ) : (
              <div className="border-t">
                <WorldEmptyState
                  kind={kind}
                  filtered={query.trim() !== "" || visibility !== "all"}
                  canManage={canManage}
                />
              </div>
            ))
          }
        </LoadingGate>
      </div>

      <WorldEntryDialogs
        campaignId={campaign.id}
        creating={creating}
        renaming={renaming}
        deleting={deleting}
        busy={busy}
        reload={reload}
        onDelete={handleDelete}
        onCloseCreate={() => setCreating(null)}
        onCloseRename={() => setRenaming(null)}
        onCloseDelete={() => setDeleting(null)}
      />
    </div>
  )
}
