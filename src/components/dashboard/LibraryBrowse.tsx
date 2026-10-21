import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useLibraryView } from "@/hooks/use-library-view"
import { useRowReorder } from "@/hooks/use-row-reorder"
import { useSelectionBox } from "@/hooks/use-selection-box"
import { useWorldBulk } from "@/hooks/use-world-bulk"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldEntryDelete } from "@/hooks/use-world-entry-delete"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { LibrarySelectionFooter } from "./LibrarySelectionFooter"
import { LibraryWindow } from "./LibraryWindow"
import { NewEntryButton } from "./NewEntryButton"
import { SelectHint } from "./SelectHint"
import { SelectionBox } from "./SelectionBox"
import { useWorldScope } from "./useWorldScope"
import { WorldEntryCard } from "./WorldEntryCard"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { createWorldManage } from "./world-manage"

type Props = {
  compact: boolean
  // Told whether entries are picked, so Escape lets go of them before it closes.
  onHold: (holding: boolean) => void
}

// The Library window: the same window as "Add from your library", where a card
// opens its entry and has its own menu, and "New" makes an entry. Entries are
// picked and moved as in a campaign's World: Ctrl/Cmd or Shift with a click, or a
// box dragged across them, and Delete acts on what is picked; press and hold a
// card, then drag it, to change the order.
export function LibraryBrowse({ compact, onHold }: Props) {
  const scope = useWorldScope()
  const { entries, error, reload, setRevealed, reorder } = useWorldEntries(scope)
  const view = useLibraryView(entries)
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const removal = useWorldEntryDelete(reload, setActionError)
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  const shownIds = view.shown?.map((entry) => entry.id) ?? []
  const selection = useEntrySelection({
    visibleIds: shownIds,
    allIds: entries?.map((entry) => entry.id) ?? [],
    // Another kind or search starts the picking over, so nothing out of sight is
    // acted on.
    viewKey: `${view.kind}|${view.query}`,
    container: root,
  })
  const bulk = useWorldBulk({ entries, selection, reload, setError: setActionError })
  useEffect(() => {
    onHold(selection.active)
  }, [onHold, selection.active])

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

  const { rowProps } = useRowReorder({
    ids: shownIds,
    // Holding a card to move it would fight with picking cards.
    onReorder: selection.active ? undefined : manage.onReorder,
    grid: true,
  })
  const { onPointerDown, box } = useSelectionBox({
    container: scroller,
    enabled: bulk.progress === null,
    selected: selection.selected,
    onSelect: selection.set,
    onClear: selection.clear,
  })

  return (
    <>
      {actionError && <FormAlert tone="error">{actionError}</FormAlert>}
      <LibraryWindow
        rootRef={root}
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
        scroller={{ ref: scroller, onPointerDown, overlay: <SelectionBox box={box} /> }}
        renderEntry={(entry, index) => (
          <SelectHint kind="list">
            <div
              data-entry-id={entry.id}
              // The wrapper moves; the card inside takes the lifted look.
              className="rounded-lg select-none [-webkit-touch-callout:none] data-lifted:*:border-ring data-lifted:*:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
              {...rowProps(entry.id, index)}
            >
              <WorldEntryCard entry={entry} manage={manage} selection={selection} />
            </div>
          </SelectHint>
        )}
        footer={<LibrarySelectionFooter selection={selection} bulk={bulk} />}
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
