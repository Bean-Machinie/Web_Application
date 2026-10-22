import { Button } from "@/components/ui/button"
import type { CardSize } from "@/hooks/use-world-card-size"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { LIBRARY_SECTIONS } from "@/lib/library-sections"
import { newestFirst } from "@/lib/library-recency"
import type { WorldEntry } from "@/lib/world-entries"
import { WorldEntryCard } from "./WorldEntryCard"
import { gridStyle } from "./world-grid-style"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  manage: WorldManage
  selection: EntrySelection
  size: CardSize
  onSee: (sectionId: string) => void
}

// How many of the newest a section shows before "See all".
const SHOWN = { maps: 3, world: 6 } as Record<string, number>

// "All": what changed last in each section, a row of its newest with a way to the rest.
// Sections with nothing in them are left out.
export function LibraryAllView({ entries, manage, selection, size, onSee }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {LIBRARY_SECTIONS.filter((section) => section.id !== "all").map((section) => {
        const matching = entries.filter(section.matches)
        if (matching.length === 0) return null
        const wide = section.id === "maps"
        const Icon = section.icon

        return (
          <section key={section.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon className="text-muted-foreground size-4" />
              <h3 className="font-medium">{section.label}</h3>
              <span className="text-muted-foreground text-sm tabular-nums">{matching.length}</span>
              <Button variant="link" size="sm" className="ml-auto" onClick={() => onSee(section.id)}>
                See all
              </Button>
            </div>
            <div style={gridStyle(size, wide)} className="grid gap-4">
              {newestFirst(matching)
                .slice(0, SHOWN[section.id] ?? 6)
                .map((entry) => (
                  <WorldEntryCard key={entry.id} entry={entry} manage={manage} selection={selection} wide={wide} />
                ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
