import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useLibraryPicker } from "@/hooks/use-library-picker"
import { cn } from "@/lib/utils"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { libraryKinds } from "@/lib/world-scope"
import { LibraryPickCard } from "./LibraryPickCard"
import { MarkerKindTabs } from "./MarkerKindTabs"

type Props = {
  add: (entryId: string) => Promise<void>
  // How many were added, as soon as there are any, even if a later one fails.
  onAdded: (count: number) => void
  onClose: () => void
  // On a phone: filling a sheet, and with room for fingers.
  compact?: boolean
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
const GRID_SMALL = "grid grid-cols-3 gap-2"

// Only mounted while the dialog is open, so it starts fresh every time. The
// library as a grid to pick from, with the kinds beside it like the marker
// picker; "Add" copies the picked entries one after another.
export function AddFromLibraryBody({ add, onAdded, onClose, compact }: Props) {
  const { entries, loadError, selected, toggle, progress, error, addSelected } = useLibraryPicker({
    add,
    onAdded,
    onClose,
  })
  const [kind, setKind] = useState<WorldEntryKind | null>(null)
  const [query, setQuery] = useState("")
  const busy = progress !== null

  const shown =
    entries && viewEntries(entries, { kind, query, visibility: "all", sort: null, searchText: null })

  const count = selected.size

  return (
    <div
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
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
              compact ? "py-0.5" : "-mr-3 -ml-2 py-2 pr-3 pl-2"
            )}
          >
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
              <div className={compact ? GRID_SMALL : GRID}>
                {shown.map((entry) => (
                  <LibraryPickCard
                    key={entry.id}
                    entry={entry}
                    selected={selected.has(entry.id)}
                    disabled={busy}
                    onToggle={toggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3">
        <span className="text-muted-foreground text-sm">
          {progress ?? (count === 0 ? "Pick the entries to add." : `${count} selected`)}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={addSelected} disabled={busy || count === 0}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {count > 0 ? `Add ${count}` : "Add"}
          </Button>
        </div>
      </div>
    </div>
  )
}
