import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { errorMessage } from "@/lib/campaigns"
import { fetchWorldEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { normalize } from "@/lib/world-search"
import { WORLD_KINDS } from "@/lib/world-kinds"

type Props = {
  campaignId: string
  // The map itself cannot be pinned to itself.
  exceptId: string
  disabled: boolean
  onPick: (entry: WorldEntry) => void
  onError: (message: string) => void
}

// Search the campaign's entries and pick one to link.
export function MarkerEntryList({ campaignId, exceptId, disabled, onPick, onError }: Props) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetchWorldEntries(campaignId)
      .then(setEntries)
      .catch((failure) => onError(errorMessage(failure)))
  }, [campaignId, onError])

  const shown = entries
    ?.filter((entry) => entry.id !== exceptId)
    .filter((entry) => normalize(entry.name).includes(normalize(query.trim())))

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          autoFocus
          autoComplete="off"
          placeholder="Search entries"
          className="pl-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="-mx-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto px-1">
        {!shown ? (
          <Skeleton className="h-24 w-full" />
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {query ? "No matches." : "No other entries yet."}
          </p>
        ) : (
          shown.map((entry) => {
            const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]
            return (
              <button
                key={entry.id}
                type="button"
                disabled={disabled}
                onClick={() => onPick(entry)}
                className="hover:bg-muted focus-visible:ring-ring flex items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-2 disabled:opacity-60"
              >
                <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <KindIcon className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{entry.name}</span>
                <Badge variant="outline">{label}</Badge>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
