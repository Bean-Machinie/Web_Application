import { Pencil, PanelRight, PanelTop, Plus, Trash2 } from "lucide-react"
import type { MemberAction } from "./MemberMenu"

type Handlers = {
  canManage: boolean
  onNewTab: () => void
  onRight: () => void
  onAdd: () => void
  onRename: () => void
  onDelete: () => void
}

// The menu of a page, the same in the tree and in the rail.
export function pageActions(h: Handlers): MemberAction[] {
  return [
    { label: "Open in new tab", icon: PanelTop, onSelect: h.onNewTab },
    { label: "Open to the right", icon: PanelRight, onSelect: h.onRight },
    ...(h.canManage
      ? [
          { label: "Add page inside", icon: Plus, onSelect: h.onAdd },
          { label: "Rename", icon: Pencil, onSelect: h.onRename },
          { label: "Delete", icon: Trash2, destructive: true, onSelect: h.onDelete },
        ]
      : []),
  ]
}
