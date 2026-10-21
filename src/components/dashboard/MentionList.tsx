import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"

export type MentionItem = { id: string; label: string; kind: WorldEntryKind; hidden: boolean }

export type MentionListProps = {
  items: MentionItem[]
  command: (item: { id: string; label: string }) => void
}

export type MentionListHandle = { onKeyDown: (event: KeyboardEvent) => boolean }

// The picker that opens at the cursor after @: the entries that match, with
// arrow keys, Enter and Tab to choose. Hidden entries say so, because players
// will read the name as plain text.
export const MentionList = forwardRef<MentionListHandle, MentionListProps>(function MentionList(
  { items, command },
  ref
) {
  const [active, setActive] = useState(0)

  useEffect(() => setActive(0), [items])

  const choose = (index: number) => {
    const item = items[index]
    if (item) command({ id: item.id, label: item.label })
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false
      if (event.key === "ArrowDown") setActive((active + 1) % items.length)
      else if (event.key === "ArrowUp") setActive((active + items.length - 1) % items.length)
      else if (event.key === "Enter" || event.key === "Tab") choose(active)
      else return false
      return true
    },
  }))

  return (
    <div className="bg-popover text-popover-foreground w-64 overflow-hidden rounded-md border p-1 shadow-md">
      {items.length === 0 ? (
        <p className="text-muted-foreground px-2 py-1.5 text-sm">No entries found</p>
      ) : (
        items.map((item, index) => {
          const { icon: Icon } = WORLD_KINDS[item.kind]
          return (
            <button
              key={item.id}
              type="button"
              // Keeps the cursor in the editor while choosing.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                index === active && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.hidden && <HiddenBadge />}
            </button>
          )
        })
      )}
    </div>
  )
})
