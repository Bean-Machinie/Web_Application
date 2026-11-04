import { useMemo, useState } from "react"
import { closestCenter, DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PanelLeftClose, Plus } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useStoredValue } from "@/hooks/use-stored-value"
import { useJournalTreeDrag } from "@/hooks/use-journal-tree-drag"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import { campaignPath } from "@/lib/campaign-paths"
import type { JournalNode } from "@/lib/journal"
import { startPageDrag } from "@/lib/journal-page-drag"
import type { DropTarget } from "@/lib/journal-drop-target"
import { filteredRows, visibleRows } from "@/lib/journal-tree"
import { activeTab, tabKey } from "@/lib/journal-workspace"
import type { Where } from "@/lib/journal-workspace"
import { JournalDeleteDialog } from "./JournalDeleteDialog"
import { JournalTreeRow } from "./JournalTreeRow"
import { mountPageTag } from "./page-drag-tag"
import type { OpenMode } from "./JournalTreeRow"

type Props = {
  tree: JournalTreeState
  space: JournalWorkspaceState
  campaignId: string
  canManage: boolean
  onCollapse: () => void
}

function readIds(text: string | null): ReadonlySet<string> {
  try {
    const ids = JSON.parse(text ?? "[]") as unknown
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [])
  } catch {
    return new Set()
  }
}

const writeIds = (ids: ReadonlySet<string>) => JSON.stringify([...ids])

const WHERE: Record<OpenMode, Where> = {
  current: { kind: "current" },
  tab: { kind: "newTab" },
  right: { kind: "other" },
}

// The pages of the journal as a tree, with a filter above it. Click a page to open
// it in the current tab; Ctrl or Cmd click, or the menu, for a new tab or the pane
// on the right. Drag one to reorder it, or sideways to put it inside the page above.
export function JournalTree({ tree, space, campaignId, canManage, onCollapse }: Props) {
  const nodes = useMemo(() => tree.nodes ?? [], [tree.nodes])
  // Which pages were folded, remembered per campaign.
  const [collapsed, setCollapsed] = useStoredValue(`journal-collapsed:${campaignId}`, readIds, writeIds)
  const [deleting, setDeleting] = useState<JournalNode | null>(null)
  const [query, setQuery] = useState("")
  const filtering = query.trim() !== ""
  const rows = useMemo(
    () => (filtering ? filteredRows(nodes, query) : visibleRows(nodes, collapsed)),
    [nodes, collapsed, query, filtering]
  )
  const parents = useMemo(() => new Set(nodes.map((node) => node.parentId)), [nodes])
  const drag = useJournalTreeDrag(nodes, rows, collapsed, tree.move)
  const pagePath = (id: string) => campaignPath(campaignId, `journal/${id}`)

  const showing = activeTab(space.workspace)
  const openIds = useMemo(
    () => new Set(space.workspace.panes.flatMap((pane) => pane.tabs.filter((tab) => tab.kind === "page").map((tab) => tab.id))),
    [space.workspace]
  )

  function toggle(id: string, open: boolean) {
    const next = new Set(collapsed)
    if (open) next.delete(id)
    else next.add(id)
    setCollapsed(next)
  }

  // A page dragged out of the tree and let go over the workspace.
  function dropPage(id: string, drop: DropTarget) {
    const tab = { kind: "page", id }
    if (drop.kind === "edge") {
      space.open(tab, { kind: "other", from: drop.pane })
      return
    }
    space.open(tab, { kind: "newTab", pane: drop.pane })
    if (drop.kind === "tab") space.move(tabKey(tab), { pane: drop.pane, index: drop.index })
  }

  async function add(parentId: string | null) {
    const id = await tree.create(parentId)
    if (!id) return
    if (parentId) toggle(parentId, true)
    space.open({ kind: "page", id }, { kind: "current" })
  }

  return (
    <nav aria-label="Journal pages" className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b px-1.5">
        <Input
          aria-label="Filter pages"
          placeholder="Filter pages…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-7"
        />
        {canManage && (
          <Button variant="ghost" size="icon-sm" aria-label="New page" onClick={() => add(null)}>
            <Plus />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Collapse panel" onClick={onCollapse}>
          <PanelLeftClose />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tree.error && <FormAlert tone="error">{tree.error}</FormAlert>}
        {tree.nodes === null && !tree.error && <Skeleton className="h-24 w-full" />}
        {tree.nodes?.length === 0 && <p className="text-muted-foreground px-2 py-1 text-sm">No pages yet.</p>}
        {tree.nodes && tree.nodes.length > 0 && rows.length === 0 && (
          <p className="text-muted-foreground px-2 py-1 text-sm">No page matches.</p>
        )}
        <DndContext
          sensors={drag.sensors}
          collisionDetection={closestCenter}
          onDragStart={drag.onDragStart}
          onDragMove={drag.onDragMove}
          onDragEnd={drag.onDragEnd}
          onDragCancel={drag.onDragCancel}
        >
          <SortableContext items={drag.shown.map((row) => row.node.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-px">
              {drag.shown.map((row) => (
                <JournalTreeRow
                  key={row.node.id}
                  row={row}
                  to={pagePath(row.node.id)}
                  active={showing?.kind === "page" && showing.id === row.node.id}
                  inTab={openIds.has(row.node.id)}
                  open={filtering || !collapsed.has(row.node.id)}
                  hasChildren={parents.has(row.node.id)}
                  canManage={canManage}
                  canDrag={canManage && !filtering}
                  depth={row.node.id === drag.activeId && drag.projected ? drag.projected.depth : row.depth}
                  onOpen={(mode) => space.open({ kind: "page", id: row.node.id }, WHERE[mode])}
                  onDragOut={(event) =>
                    startPageDrag(
                      event,
                      space.workspace.panes.length,
                      mountPageTag(row.node.id, row.node.title || "Untitled"),
                      (drop) => dropPage(row.node.id, drop)
                    )
                  }
                  onToggle={() => toggle(row.node.id, collapsed.has(row.node.id))}
                  onAdd={() => add(row.node.id)}
                  onRename={(title) => tree.rename(row.node.id, title)}
                  onDelete={() => setDeleting(row.node)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
      <JournalDeleteDialog
        page={deleting}
        hasChildren={!!deleting && parents.has(deleting.id)}
        onDelete={(page) => tree.remove(page.id)}
        onClose={() => setDeleting(null)}
      />
    </nav>
  )
}
