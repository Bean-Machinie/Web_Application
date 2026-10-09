import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
import { cn } from "@/lib/utils"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { MarkerEntryCard } from "./MarkerEntryCard"
import { MarkerKindTabs } from "./MarkerKindTabs"
import { WorldEmptyState } from "./WorldEmptyState"

type Props = {
  campaignId: string
  // The map itself cannot be pinned to itself.
  exceptId: string
  disabled: boolean
  onPick: (entry: WorldEntry) => void
  // Starts creating an entry of this kind (the open tab, if any).
  onCreate: (kind: WorldEntryKind | null) => void
  // On a phone: the kinds as a row of chips over a list of entries, in the height of a
  // sheet, with no keyboard raised before anything is asked for.
  compact?: boolean
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
// On a phone the cards are smaller, so more of them are in sight.
const GRID_SMALL = "grid grid-cols-3 gap-2"
// The world page in small: the kinds down the side, a search that also looks
// past names, and the campaign's entries, maps included, to click one. It
// takes the height the screen allows, with the kinds beside the entries and not
// above them, so the entries get as much room as possible. The height is fixed
// so changing kind or searching never makes the dialog jump.
export function MarkerEntryPicker({ campaignId, exceptId, disabled, onPick, onCreate, compact }: Props) {
  const { entries, error } = useWorldEntries(campaignId)
  const [kind, setKind] = useState<WorldEntryKind | null>(null)
  const [query, setQuery] = useState("")
  const searchText = useWorldSearchText(campaignId, query.trim() !== "")

  const others = useMemo(
    () => entries?.filter((entry) => entry.id !== exceptId) ?? null,
    [entries, exceptId]
  )
  const shown =
    others && viewEntries(others, { kind, query, visibility: "all", sort: null, searchText })

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3",
        // In a sheet it takes what the sheet leaves, by flex and not by a percentage
        // height, which Safari does not resolve here: the list is the part that scrolls.
        compact ? "min-h-0 flex-1" : "h-[calc(100svh-13rem)] max-h-[52rem] min-h-80 sm:flex-row sm:gap-5"
      )}
    >
      <MarkerKindTabs entries={others} active={kind} onChange={setKind} compact={compact} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              autoFocus={!compact}
              autoComplete="off"
              placeholder="Search entries"
              aria-label="Search entries"
              className="pointer-coarse:h-11 pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={disabled}
            aria-label="New entry"
            className={compact ? "size-11 shrink-0 px-0" : undefined}
            onClick={() => onCreate(kind)}
          >
            <Plus />
            {!compact && "New entry"}
          </Button>
        </div>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {/* The scrollbar sits in the dialog's margin, so the cards line up with
            the search above. */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
            compact ? "py-0.5" : "-mr-3 -ml-2 py-2 pr-3 pl-2"
          )}
        >
          {!shown ? (
            <div className={compact ? GRID_SMALL : GRID}>
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] w-full" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <WorldEmptyState kind={kind} filtered={query.trim() !== ""} canManage />
          ) : (
            <div className={compact ? GRID_SMALL : GRID}>
              {shown.map((entry) => (
                <MarkerEntryCard key={entry.id} entry={entry} disabled={disabled} onPick={onPick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
