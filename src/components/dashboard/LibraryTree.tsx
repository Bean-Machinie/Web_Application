import { Info, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useStoredValue } from "@/hooks/use-stored-value"
import { guidesFor } from "@/lib/journal-tree"
import { LIBRARY_GROUPS } from "@/lib/library-sections"
import { libraryRows } from "@/lib/library-tree"
import { readIds, writeIds } from "@/lib/stored-ids"
import { LibraryTreeRow } from "./LibraryTreeRow"

type Props = {
  active: string
  // Null where a count is not known yet.
  count: (sectionId: string) => number | null
  onSelect: (sectionId: string) => void
  onCollapse: () => void
}

// The library's tree in the side panel, as the journal's is: Yours and the SRD, each a group of
// nodes that fold. Choosing one filters what the page shows.
export function LibraryTree({ active, count, onSelect, onCollapse }: Props) {
  const [collapsed, setCollapsed] = useStoredValue("library-collapsed", readIds, writeIds)

  function toggle(id: string) {
    const next = new Set(collapsed)
    if (!next.delete(id)) next.add(id)
    setCollapsed(next)
  }

  return (
    <nav aria-label="Library" className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between border-b pr-1.5 pl-3">
        <span className="text-sm font-medium">Library</span>
        <Button variant="ghost" size="icon-sm" aria-label="Collapse panel" onClick={onCollapse}>
          <PanelLeftClose />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2">
        {LIBRARY_GROUPS.map((group) => {
          const rows = libraryRows(group.sections, collapsed)
          return (
            <section key={group.title} className="flex flex-col gap-1">
              <h2 className="text-muted-foreground flex items-center gap-1.5 px-2 text-xs font-medium">
                {group.title}
                {"hint" in group && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label={`About ${group.title}`} className="outline-none">
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{group.hint}</TooltipContent>
                  </Tooltip>
                )}
              </h2>
              <ul className="flex flex-col">
                {rows.map((row, index) => (
                  <LibraryTreeRow
                    key={row.section.id}
                    section={row.section}
                    depth={row.depth}
                    guides={guidesFor(rows, index)}
                    active={active === row.section.id}
                    open={!collapsed.has(row.section.id)}
                    hasChildren={!!row.section.children}
                    count={count(row.section.id)}
                    onSelect={() => onSelect(row.section.id)}
                    onToggle={() => toggle(row.section.id)}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </nav>
  )
}
