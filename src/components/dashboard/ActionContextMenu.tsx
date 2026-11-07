import { useContext } from "react"
import type { ReactNode } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { BulkMenuContext } from "./BulkMenuContext"
import type { MemberAction } from "./MemberMenu"

// A right-click menu from a list of actions, the same list a three-dot menu takes:
// destructive ones last and set apart. `details` are lines of what the row shows that its columns
// may have dropped for want of room, read-only above the actions. Given the `pickId` of what it is
// on, a menu opened on one of several picked entries is the actions on all of them (from the
// nearest WorldBulkMenu); one opened on an entry that is not picked lets go of the others first,
// as a file manager does, and is that entry's own.
type Props = { actions: MemberAction[]; details?: string[]; pickId?: string; children: ReactNode }

export function ActionContextMenu({ actions: own, details: ownDetails = [], pickId, children }: Props) {
  const bulk = useContext(BulkMenuContext)
  const forAll = !!bulk && pickId !== undefined && bulk.selection.active && bulk.selection.isSelected(pickId)
  const actions = forAll ? bulk.actions : own
  const details = forAll ? [`${bulk.selection.count} selected`] : ownDetails
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
      <ContextMenuTrigger
        asChild
        onContextMenu={() => {
          if (bulk && pickId !== undefined && bulk.selection.active && !bulk.selection.isSelected(pickId)) bulk.selection.clear()
        }}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {details.length > 0 && (
          <>
            {details.map((line) => (
              <div key={line} className="text-muted-foreground px-1.5 py-0.5 text-xs">
                {line}
              </div>
            ))}
            <ContextMenuSeparator />
          </>
        )}
        {safe.map(item)}
        {safe.length > 0 && destructive.length > 0 && <ContextMenuSeparator />}
        {destructive.map(item)}
      </ContextMenuContent>
    </ContextMenu>
  )
}
