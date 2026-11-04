import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { closestCenter, DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useJournalTreeDrag } from "@/hooks/use-journal-tree-drag"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import { campaignPath } from "@/lib/campaign-paths"
import type { JournalNode } from "@/lib/journal"
import { descendantIds, visibleRows } from "@/lib/journal-tree"
import { JournalDeleteDialog } from "./JournalDeleteDialog"
import { JournalTreeRow } from "./JournalTreeRow"

type Props = {
  tree: JournalTreeState
  campaignId: string
  canManage: boolean
  // The page that is open, if any.
  openId: string | undefined
}

// The pages of the journal as a tree: open one, add, rename and delete them, and
// drag one to reorder it, or sideways to put it inside the page above.
export function JournalTree({ tree, campaignId, canManage, openId }: Props) {
  const navigate = useNavigate()
  const nodes = useMemo(() => tree.nodes ?? [], [tree.nodes])
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const [deleting, setDeleting] = useState<JournalNode | null>(null)
  const rows = useMemo(() => visibleRows(nodes, collapsed), [nodes, collapsed])
  const parents = useMemo(() => new Set(nodes.map((node) => node.parentId)), [nodes])
  const drag = useJournalTreeDrag(nodes, rows, collapsed, tree.move)
  const pagePath = (id: string) => campaignPath(campaignId, `journal/${id}`)

  function toggle(id: string, open: boolean) {
    setCollapsed((old) => {
      const next = new Set(old)
      if (open) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function add(parentId: string | null) {
    const id = await tree.create(parentId)
    if (!id) return
    if (parentId) toggle(parentId, true)
    navigate(pagePath(id))
  }

  async function remove(page: JournalNode) {
    const inside = descendantIds(nodes, page.id)
    const deleted = await tree.remove(page.id)
    if (deleted && openId && (openId === page.id || inside.has(openId))) {
      navigate(campaignPath(campaignId, "journal"))
    }
    return deleted
  }

  return (
    <nav aria-label="Journal pages" className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-sm font-semibold">Journal</h2>
        {canManage && (
          <Button variant="ghost" size="icon-sm" aria-label="New page" onClick={() => add(null)}>
            <Plus />
          </Button>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tree.error && <FormAlert tone="error">{tree.error}</FormAlert>}
        {tree.nodes === null && !tree.error && <Skeleton className="h-24 w-full" />}
        {tree.nodes?.length === 0 && (
          <p className="text-muted-foreground px-2 py-1 text-sm">No pages yet.</p>
        )}
        <DndContext
          sensors={drag.sensors}
          collisionDetection={closestCenter}
          onDragStart={drag.onDragStart}
          onDragMove={drag.onDragMove}
          onDragEnd={drag.onDragEnd}
          onDragCancel={drag.onDragCancel}
        >
          <SortableContext
            items={drag.shown.map((row) => row.node.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-px">
              {drag.shown.map((row) => (
                <JournalTreeRow
                  key={row.node.id}
                  row={row}
                  to={pagePath(row.node.id)}
                  active={row.node.id === openId}
                  open={!collapsed.has(row.node.id)}
                  hasChildren={parents.has(row.node.id)}
                  canManage={canManage}
                  depth={row.node.id === drag.activeId && drag.projected ? drag.projected.depth : row.depth}
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
        onDelete={remove}
        onClose={() => setDeleting(null)}
      />
    </nav>
  )
}
