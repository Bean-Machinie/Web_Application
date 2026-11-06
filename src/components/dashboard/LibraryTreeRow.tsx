import { ChevronRight } from "lucide-react"
import type { Guide } from "@/lib/journal-tree"
import { INDENT_PX } from "@/lib/journal-drop"
import type { LibrarySection } from "@/lib/library-sections"
import { cn } from "@/lib/utils"
import { IndentGuides } from "./IndentGuides"

type Props = {
  section: LibrarySection
  depth: number
  guides: Guide[]
  active: boolean
  open: boolean
  hasChildren: boolean
  count: number | null
  onSelect: () => void
  onToggle: () => void
}

// One node of the library tree, drawn as a row of the journal tree: the chevron that turns, the
// guide lines in the indent, and the count at the right.
export function LibraryTreeRow({ section, depth, guides, active, open, hasChildren, count, onSelect, onToggle }: Props) {
  const Icon = section.icon

  return (
    <li>
      <div style={{ paddingLeft: depth * INDENT_PX }} className="relative flex">
        <IndentGuides guides={guides} />
        <div
          className={cn(
            "hover:bg-sidebar-accent/50 relative flex h-7 min-w-0 flex-1 items-center gap-0.5 rounded-md pr-2",
            active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent"
          )}
        >
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={hasChildren ? open : undefined}
            disabled={!hasChildren}
            onClick={onToggle}
            className={cn("text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-md outline-none", !hasChildren && "invisible")}
          >
            <ChevronRight className={cn("size-3.5 transition-transform duration-150 ease-in-out", open && "rotate-90")} />
          </button>
          <button
            type="button"
            onClick={onSelect}
            aria-current={active ? "page" : undefined}
            className={cn("focus-visible:ring-sidebar-ring flex min-w-0 flex-1 items-center gap-2 rounded-sm py-1 text-left text-sm outline-none focus-visible:ring-2", depth > 0 && !active && "text-muted-foreground")}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{section.label}</span>
          </button>
          {count !== null && <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{count}</span>}
        </div>
      </div>
    </li>
  )
}
