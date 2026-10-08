import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
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
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

// The world page in small: the kinds down the side, a search that also looks
// past names, and the campaign's entries, maps included, to click one. It
// takes the height the screen allows, with the kinds beside the entries and not
// above them, so the entries get as much room as possible. The height is fixed
// so changing kind or searching never makes the dialog jump.
export function MarkerEntryPicker({ campaignId, exceptId, disabled, onPick, onCreate }: Props) {
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
    <div className="flex h-[calc(100svh-13rem)] max-h-[52rem] min-h-80 flex-col gap-3 sm:flex-row sm:gap-5">
      <MarkerKindTabs entries={others} active={kind} onChange={setKind} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              autoComplete="off"
              placeholder="Search entries"
              aria-label="Search entries"
              className="pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="outline" disabled={disabled} onClick={() => onCreate(kind)}>
            <Plus />
            New entry
          </Button>
        </div>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {/* The scrollbar sits in the dialog's margin, so the cards line up with
            the search above. */}
        <div className="-mr-3 -ml-2 min-h-0 flex-1 overflow-y-auto py-2 pr-3 pl-2 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
          {!shown ? (
            <div className={GRID}>
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] w-full" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <WorldEmptyState kind={kind} filtered={query.trim() !== ""} canManage />
          ) : (
            <div className={GRID}>
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
