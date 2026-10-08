import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useIsMobile } from "@/hooks/use-mobile"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
import { useWorldViewMode } from "@/hooks/use-world-view-mode"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { deleteWorldEntry } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { deleteWorldImage } from "@/lib/world-images"
import { WORLD_KINDS, worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { rememberWorldKind } from "@/lib/world-tab"
import type { Sort, VisibilityFilter } from "@/lib/world-list"
import { useCampaign } from "./useCampaign"
import { usePageTrail } from "./usePageTrail"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"
import { WorldListSkeleton } from "./WorldListSkeleton"
import { WorldTabs } from "./WorldTabs"
import { WorldToolbar } from "./WorldToolbar"
import type { WorldManage } from "./world-manage"

// Render with key={campaign.id} so switching campaigns starts from scratch.
export function WorldEntryList({ campaign }: { campaign: Campaign }) {
  const { can } = useCampaign()
  const canManage = can("manage_world")
  const { entries, error, reload, setRevealed, reorder } = useWorldEntries(campaign.id)
  const [params] = useSearchParams()
  const [chosenMode, setMode] = useWorldViewMode()
  // Phones only get the grid; the saved choice is kept for larger screens.
  const mode = useIsMobile() ? "grid" : chosenMode
  const [query, setQuery] = useState("")
  const [visibility, setVisibility] = useState<VisibilityFilter>("all")
  const [sort, setSort] = useState<Sort>(null)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [deleting, setDeleting] = useState<WorldEntry | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // An unknown ?kind= falls back to All.
  const kind = worldKinds.find((option) => option === params.get("kind")) ?? null
  useEffect(() => rememberWorldKind(kind), [kind])
  usePageTrail(
    kind ? [{ label: "World", to: "/app/world" }, { label: WORLD_KINDS[kind].plural }] : null
  )

  const searchText = useWorldSearchText(campaign.id, query.trim() !== "")
  const shown = entries && viewEntries(entries, {
      kind,
      query,
      visibility,
      // Only the list has column headers to sort by.
      sort: mode === "list" ? sort : null,
      searchText,
    })

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteWorldEntry(deleting!.id)
      // The file is no longer referenced; failing to remove it is harmless.
      await deleteWorldImage(deleting!.imagePath).catch(() => {})
      setDeleting(null)
      await reload()
    } catch (failure) {
      setActionError(errorMessage(failure))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  const manage: WorldManage | null = canManage
    ? {
        onReveal: (entry, revealed) => {
          setActionError(null)
          setRevealed(entry.id, revealed).catch((failure) =>
            setActionError(errorMessage(failure))
          )
        },
        onReorder: (ids) => {
          setActionError(null)
          reorder(ids).catch((failure) => setActionError(errorMessage(failure)))
        },
        onRename: setRenaming,
        onDelete: setDeleting,
        actionsFor: (entry) => [
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
    <div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4">
      <WorldTabs entries={entries} active={kind} />
      <div className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg border border-b-0 shadow-xs">
        <WorldToolbar
          query={query}
          onQuery={setQuery}
          visibility={canManage ? visibility : null}
          onVisibility={setVisibility}
          onCreate={canManage ? setCreating : null}
          mode={mode}
          onMode={setMode}
        />

        {(error || actionError) && (
          <div className="border-t px-6 py-4">
            <FormAlert tone="error">{(error || actionError)!}</FormAlert>
          </div>
        )}
        <LoadingGate
          loading={!entries && !error}
          className="flex min-h-0 flex-1 flex-col border-t"
          skeleton={
            mode === "grid" ? (
              <WorldGridSkeleton />
            ) : (
              <WorldListSkeleton canManage={canManage} />
            )
          }
        >
          {() =>
            shown && (
              <WorldEntryResults
                entries={shown}
                mode={mode}
                kind={kind}
                filtered={query.trim() !== "" || visibility !== "all"}
                canManage={canManage}
                manage={manage}
                sort={sort}
                onSort={setSort}
              />
            )
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
