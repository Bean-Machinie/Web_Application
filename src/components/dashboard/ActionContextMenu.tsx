import type { ReactNode } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { MemberAction } from "./MemberMenu"

// A right-click menu from a list of actions, the same list a three-dot menu takes:
// destructive ones last and set apart.
export function ActionContextMenu({ actions, children }: { actions: MemberAction[]; children: ReactNode }) {
  if (actions.length === 0) return <>{children}</>
  const safe = actions.filter((action) => !action.destructive)
  const destructive = actions.filter((action) => action.destructive)

  const item = ({ label, icon: Icon, destructive, disabled, onSelect }: MemberAction) => (
    <ContextMenuItem key={label} variant={destructive ? "destructive" : "default"} disabled={disabled} onSelect={onSelect}>
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
