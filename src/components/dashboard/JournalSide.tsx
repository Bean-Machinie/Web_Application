import { useState } from "react"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import type { JournalNode } from "@/lib/journal"
import { activeTab } from "@/lib/journal-workspace"
import type { Where } from "@/lib/journal-workspace"
import { cn } from "@/lib/utils"
import { JournalDeleteDialog } from "./JournalDeleteDialog"
import { JournalRail } from "./JournalRail"
import { JournalTree } from "./JournalTree"
import type { OpenMode } from "./JournalTreeRow"

type Props = {
  tree: JournalTreeState
  space: JournalWorkspaceState
  campaignId: string
  canManage: boolean
  open: boolean
  onToggle: (open: boolean) => void
}

const WHERE: Record<OpenMode, Where> = {
  current: { kind: "current" },
  tab: { kind: "newTab" },
  right: { kind: "other" },
}

// What fills the side panel: the tree when it is wide, the rail when it is narrow. Both
// are always there and cross-fade as the panel moves; the tree keeps a width of its own
// and is clipped, so it does not rewrap on the way. Renaming and deleting are held here,
// since the rail asks for them as well.
export function JournalSide({ tree, space, campaignId, canManage, open, onToggle }: Props) {
  const [renaming, setRenaming] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<JournalNode | null>(null)
  const showing = activeTab(space.workspace)
  const pageId = showing?.kind === "page" ? showing.id : null

  async function add(parentId: string | null) {
    const id = await tree.create(parentId)
    if (id) space.open({ kind: "page", id }, { kind: "current" })
  }

  // A name is typed in the tree, so the rail opens it first.
  function rename(id: string) {
    onToggle(true)
    setRenaming(id)
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div inert={!open} className={cn("flex h-full min-w-50 flex-col transition-opacity ease-linear", open ? "delay-100 duration-150" : "opacity-0 duration-100")}>
        <JournalTree
          tree={tree}
          space={space}
          campaignId={campaignId}
          canManage={canManage}
          onCollapse={() => onToggle(false)}
          renaming={renaming}
          onRenaming={setRenaming}
          onDelete={setDeleting}
        />
      </div>
      <div inert={open} className={cn("absolute inset-y-0 left-0 w-12 transition-opacity ease-linear", open ? "opacity-0 duration-100" : "delay-100 duration-150")}>
        <JournalRail
          nodes={tree.nodes ?? []}
          activeId={pageId}
          canManage={canManage}
          onOpen={(id, mode) => space.open({ kind: "page", id }, WHERE[mode])}
          onAdd={add}
          onRename={rename}
          onDelete={setDeleting}
          onExpand={() => onToggle(true)}
        />
      </div>
      <JournalDeleteDialog
        page={deleting}
        hasChildren={!!deleting && !!tree.nodes?.some((node) => node.parentId === deleting.id)}
        onDelete={(page) => tree.remove(page.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
