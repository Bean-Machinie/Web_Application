import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { INDENT_PX } from "@/lib/journal-drop"
import type { TreeRow } from "@/lib/journal-tree"
import { cn } from "@/lib/utils"
import { IndentGuides } from "./IndentGuides"
import { UNTITLED } from "./JournalRowTitle"

type Props = {
  // The page and everything inside it, in tree order, the page itself at depth 0.
  rows: TreeRow[]
  activeId: string | null
  onOpen: (id: string) => void
}

// The page with its pages inside, drawn as in the tree: chevrons, indent and guide lines.
// Folding here is for as long as the card is open and does not touch the tree's.
export function JournalRailFlyout({ rows, activeId, onOpen }: Props) {
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set())

  const parents = new Set(rows.filter((row, i) => (rows[i + 1]?.depth ?? 0) > row.depth).map((row) => row.node.id))
  const shown: TreeRow[] = []
  let hiddenBelow: number | null = null
  for (const row of rows) {
    if (hiddenBelow !== null && row.depth > hiddenBelow) continue
    hiddenBelow = folded.has(row.node.id) ? row.depth : null
    shown.push(row)
  }

  function toggle(id: string) {
    const next = new Set(folded)
    if (!next.delete(id)) next.add(id)
    setFolded(next)
  }

  return (
    <ul className="flex flex-col">
      {shown.map(({ node, depth }) => {
        const hasChildren = parents.has(node.id)
        const active = activeId === node.id
        return (
          <li key={node.id} className="relative flex" style={{ paddingLeft: depth * INDENT_PX }}>
            <IndentGuides depth={depth} />
            <div
              className={cn(
                "hover:bg-sidebar-accent/50 flex h-7 min-w-0 flex-1 items-center gap-0.5 rounded-md pr-2",
                active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent"
              )}
            >
              <button
                type="button"
                aria-label={folded.has(node.id) ? "Expand" : "Collapse"}
                disabled={!hasChildren}
                onClick={() => toggle(node.id)}
                className={cn(
                  "text-muted-foreground hover:bg-sidebar-accent flex size-5 shrink-0 items-center justify-center rounded-md outline-none",
                  !hasChildren && "invisible"
                )}
              >
                <ChevronRight className={cn("size-3.5 transition-transform duration-150 ease-in-out", !folded.has(node.id) && "rotate-90")} />
              </button>
              <button
                type="button"
                onClick={() => onOpen(node.id)}
                className={cn("min-w-0 flex-1 truncate text-left text-sm outline-none", depth > 0 && !active && "text-muted-foreground")}
              >
                {node.title || UNTITLED}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
