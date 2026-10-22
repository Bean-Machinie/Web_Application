import { useContext } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { MemberMenu } from "./MemberMenu"
import { WorldTableContext } from "./WorldTableContext"

// The row's menu, there when the pointer is on the row (always on a touch screen, and
// while it is open or has the keyboard).
export function WorldActionsCell({ entry }: { entry: WorldEntry }) {
  const { manage } = useContext(WorldTableContext)
  if (!manage) return null

  return (
    <div className="relative z-10 inline-block transition-opacity has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/row:opacity-100">
      <MemberMenu name={entry.name} actions={manage.actionsFor(entry)} />
    </div>
  )
}
