import { ChevronRight } from "lucide-react"
import type { LibrarySection } from "@/lib/library-sections"
import { cn } from "@/lib/utils"
import { ListRow } from "./ListRow"

type Props = {
  section: LibrarySection
  depth: number
  active: boolean
  open: boolean
  hasChildren: boolean
  count: number | null
  onSelect: () => void
  onToggle: () => void
}

// One node in the menu of the library: the chevron that folds what is inside it, the name (with an
// icon only on the top nodes, as the journal's tree has) and the count at the right.
export function LibraryNodeRow({ section, depth, active, open, hasChildren, count, onSelect, onToggle }: Props) {
  const Icon = section.icon

  return (
    <ListRow selected={active} style={{ paddingLeft: depth * 20 }} className="h-8 gap-0.5 pr-2">
      <button
        type="button"
        aria-label={open ? "Collapse" : "Expand"}
        aria-expanded={hasChildren ? open : undefined}
        disabled={!hasChildren}
        onClick={onToggle}
        className={cn("text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md outline-none", !hasChildren && "invisible")}
      >
        <ChevronRight className={cn("size-3.5 transition-transform duration-150 ease-in-out", open && "rotate-90")} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={cn("focus-visible:ring-ring flex h-full min-w-0 flex-1 items-center gap-2 rounded-sm text-left text-sm outline-none focus-visible:ring-2", depth > 0 && !active && "text-muted-foreground")}
      >
        {depth === 0 && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{section.label}</span>
      </button>
      {count !== null && <span className="text-muted-foreground ml-auto shrink-0 pl-3 text-xs tabular-nums">{count}</span>}
    </ListRow>
  )
}
