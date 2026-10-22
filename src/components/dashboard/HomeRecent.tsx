import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { newestFirst } from "@/lib/library-recency"
import type { WorldEntry } from "@/lib/world-entries"
import { WorldEntryCard } from "./WorldEntryCard"
import { gridStyle } from "./world-grid-style"

// The last things you changed in your library.
const SHOWN = 8

// "Recently edited" at the foot of Home: the newest library entries as cards that
// open them. Nothing at all while the library is empty.
export function HomeRecent({ entries }: { entries: WorldEntry[] | null }) {
  if (!entries || entries.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Recently edited</h2>
        <Button asChild variant="link" size="sm">
          <Link to="/app/library">Your library</Link>
        </Button>
      </div>
      <div style={gridStyle("medium")} className="grid gap-4">
        {newestFirst(entries)
          .slice(0, SHOWN)
          .map((entry) => (
            <WorldEntryCard key={entry.id} entry={entry} manage={null} selection={null} />
          ))}
      </div>
    </section>
  )
}
