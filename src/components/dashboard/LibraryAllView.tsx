import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { LIBRARY_SECTIONS } from "@/lib/library-sections"
import { newestFirst } from "@/lib/library-recency"
import type { WorldEntry } from "@/lib/world-entries"
import { CardGrid } from "./CardGrid"
import { WorldEntryCard } from "./WorldEntryCard"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  manage: WorldManage
  selection: EntrySelection
  onSee: (sectionId: string) => void
}

// How many of the newest a section shows before "See all".
const SHOWN = { maps: 3, world: 6 } as Record<string, number>

// "All": what changed last in each section, a row of its newest with a way to the rest.
// Sections with nothing in them are left out.
export function LibraryAllView({ entries, manage, selection, onSee }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {LIBRARY_SECTIONS.filter((section) => section.id !== "all").map((section) => {
        const matching = entries.filter(section.matches)
        if (matching.length === 0) return null
        const wide = section.id === "maps"

        return (
          <section key={section.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <h3 className="text-base font-semibold tracking-tight">{section.label}</h3>
              <span className="text-muted-foreground text-sm tabular-nums">{matching.length}</span>
              <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto" onClick={() => onSee(section.id)}>
                See all
                <ArrowRight />
              </Button>
            </div>
            <CardGrid wide={wide}>
              {newestFirst(matching)
                .slice(0, SHOWN[section.id] ?? 6)
                .map((entry) => (
                  <WorldEntryCard key={entry.id} entry={entry} manage={manage} selection={selection} wide={wide} />
                ))}
            </CardGrid>
          </section>
        )
      })}
    </div>
  )
}
