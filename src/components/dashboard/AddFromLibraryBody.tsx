import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useLibraryPicker } from "@/hooks/use-library-picker"
import { useSelectionBox } from "@/hooks/use-selection-box"
import { cn } from "@/lib/utils"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { libraryKinds } from "@/lib/world-scope"
import { AddFromLibraryFooter } from "./AddFromLibraryFooter"
import { LibraryPickCard } from "./LibraryPickCard"
import { MarkerKindTabs } from "./MarkerKindTabs"
import { SelectionBox } from "./SelectionBox"

type Props = {
  add: (entryId: string) => Promise<void>
  // How many were added, as soon as there are any, even if a later one fails.
  onAdded: (count: number) => void
  onClose: () => void
  // Told whether entries are picked, so Escape lets go of them before it closes.
  onHold: (holding: boolean) => void
  // On a phone: filling a sheet, and with room for fingers.
  compact?: boolean
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
const GRID_SMALL = "grid grid-cols-3 gap-2"

// Only mounted while the dialog is open, so it starts fresh every time. The
// library as a grid to pick from, with the kinds beside it like the marker
// picker. Picking works as in the lists: click, Shift-click for a range,
// Ctrl/Cmd+A for everything shown, a box dragged across the cards. "Add"
// copies the picked entries one after another.
export function AddFromLibraryBody({ add, onAdded, onClose, onHold, compact }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const { entries, loadError, progress, error, addEntries } = useLibraryPicker({
    add,
    onAdded,
    onClose,
  })
  const [kind, setKind] = useState<WorldEntryKind | null>(null)
  const [query, setQuery] = useState("")
  const busy = progress !== null

  const shown =
    entries && viewEntries(entries, { kind, query, visibility: "all", sort: null, searchText: null })

  const selection = useEntrySelection({
    visibleIds: shown?.map((entry) => entry.id) ?? [],
    allIds: entries?.map((entry) => entry.id) ?? [],
    // Never starts over: picks made under one kind stay while looking at another.
    viewKey: "",
    container: root,
  })
  const { onPointerDown, box } = useSelectionBox({
    container: scroller,
    enabled: !busy,
    selected: selection.selected,
    onSelect: selection.set,
    onClear: selection.clear,
  })
  useEffect(() => {
    onHold(selection.active)
  }, [onHold, selection.active])

  const count = selection.count
  const addSelected = () =>
    addEntries(
      (entries ?? []).filter((entry) => selection.isSelected(entry.id)),
      selection.deselect
    )

  return (
    <div
      ref={root}
      className={cn(
        "flex min-w-0 flex-col gap-3",
        compact ? "min-h-0 flex-1" : "h-[calc(100svh-13rem)] max-h-[52rem] min-h-80"
      )}
    >
      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-3", !compact && "sm:flex-row sm:gap-5")}>
        <MarkerKindTabs
          entries={entries}
          active={kind}
          onChange={setKind}
          compact={compact}
          kinds={libraryKinds}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="relative shrink-0">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              autoFocus={!compact}
              autoComplete="off"
              placeholder="Search your library"
              aria-label="Search your library"
              className="pointer-coarse:h-11 pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {loadError && <FormAlert tone="error">{loadError}</FormAlert>}
          <div
            ref={scroller}
            onPointerDown={onPointerDown}
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
              compact ? "py-0.5" : "-mr-3 -ml-2 py-2 pr-3 pl-2"
            )}
          >
            <SelectionBox box={box} />
            {!shown ? (
              !loadError && (
                <div className={compact ? GRID_SMALL : GRID}>
                  {Array.from({ length: 10 }, (_, index) => (
                    <Skeleton key={index} className="aspect-[4/5] w-full" />
                  ))}
                </div>
              )
            ) : shown.length === 0 ? (
              <p className="text-muted-foreground px-2 py-10 text-center text-sm">
                {entries?.length === 0
                  ? "Your library is empty. Save entries from a campaign's World to reuse them here."
                  : "No matches. Try a different name, or another kind."}
              </p>
            ) : (
              <div className={cn(compact ? GRID_SMALL : GRID, "select-none")}>
                {shown.map((entry) => (
                  <LibraryPickCard
                    key={entry.id}
                    entry={entry}
                    selected={selection.isSelected(entry.id)}
                    disabled={busy}
                    onToggle={(picked, event) => selection.click(picked.id, event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <AddFromLibraryFooter
        progress={progress}
        picked={count}
        shown={shown?.length ?? 0}
        allShownPicked={selection.allVisibleSelected}
        onToggleAll={selection.allVisibleSelected ? selection.clear : selection.selectAllVisible}
        onCancel={onClose}
        onAdd={addSelected}
      />
    </div>
  )
}
