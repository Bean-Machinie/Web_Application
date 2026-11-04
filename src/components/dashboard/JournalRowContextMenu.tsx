import type { ReactNode } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { MemberAction } from "./MemberMenu"

// The right-click menu of a page in the tree: the same actions as its three-dot
// menu, destructive ones last and set apart.
export function JournalRowContextMenu({ actions, children }: { actions: MemberAction[]; children: ReactNode }) {
  const safe = actions.filter((action) => !action.destructive)
  const destructive = actions.filter((action) => action.destructive)

  const item = ({ label, icon: Icon, destructive, onSelect }: MemberAction) => (
    <ContextMenuItem key={label} variant={destructive ? "destructive" : "default"} onSelect={onSelect}>
      {Icon && <Icon className={destructive ? "" : "text-muted-foreground"} />}
      {label}
    </ContextMenuItem>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {safe.map(item)}
        {safe.length > 0 && destructive.length > 0 && <ContextMenuSeparator />}
        {destructive.map(item)}
      </ContextMenuContent>
    </ContextMenu>
  )
}
