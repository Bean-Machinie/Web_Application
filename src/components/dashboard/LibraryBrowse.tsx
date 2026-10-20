import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLibraryView } from "@/hooks/use-library-view"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldEntryDelete } from "@/hooks/use-world-entry-delete"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { LibraryWindow } from "./LibraryWindow"
import { NewEntryButton } from "./NewEntryButton"
import { useWorldScope } from "./useWorldScope"
import { WorldEntryCard } from "./WorldEntryCard"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { createWorldManage } from "./world-manage"

// The Library window: the same window as "Add from your library", where a card
// opens its entry and has its own menu, and "New" makes an entry.
export function LibraryBrowse({ compact }: { compact: boolean }) {
  const scope = useWorldScope()
  const { entries, error, reload, setRevealed, reorder } = useWorldEntries(scope)
  const view = useLibraryView(entries)
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const removal = useWorldEntryDelete(reload, setActionError)

  // The command palette's "New ..." actions arrive as ?create=<kind>.
  const wanted = scope.kinds.find((option) => option === params.get("create")) ?? null
  useEffect(() => {
    if (!wanted) return
    setCreating(wanted)
    setParams(
      (current) => {
        current.delete("create")
        return current
      },
      { replace: true }
    )
  }, [wanted, setParams])

  const manage = createWorldManage({
    setRevealed,
    reorder,
    onRename: setRenaming,
    onDelete: removal.setDeleting,
    onSaveToLibrary: undefined,
    setError: setActionError,
  })

  return (
    <>
      {actionError && <FormAlert tone="error">{actionError}</FormAlert>}
      <LibraryWindow
        entries={entries}
        shown={view.shown}
        kind={view.kind}
        onKind={view.setKind}
        query={view.query}
        onQuery={view.setQuery}
        loadError={error}
        compact={compact}
        toolbar={<NewEntryButton onPick={setCreating} />}
        emptyText="Your library is empty. Create an entry, or save entries from a campaign's World."
        renderEntry={(entry) => <WorldEntryCard entry={entry} manage={manage} selection={null} />}
      />
      <WorldEntryDialogs
        creating={creating}
        renaming={renaming}
        deleting={removal.deleting}
        busy={removal.busy}
        reload={reload}
        onDelete={removal.confirm}
        onCloseCreate={() => setCreating(null)}
        onCloseRename={() => setRenaming(null)}
        onCloseDelete={() => removal.setDeleting(null)}
      />
    </>
  )
}
