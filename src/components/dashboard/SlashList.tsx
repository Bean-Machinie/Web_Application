import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { SlashItem } from "./slash-items"
import type { SuggestionListHandle } from "./suggestion-render"

type Props = { items: SlashItem[]; command: (item: SlashItem) => void }

// The menu that opens at the cursor after /: the blocks that match, with arrow
// keys, Enter and Tab to choose.
export const SlashList = forwardRef<SuggestionListHandle, Props>(function SlashList(
  { items, command },
  ref
) {
  const [active, setActive] = useState(0)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => setActive(0), [items])

  // The list scrolls when there are more blocks than fit; the one chosen stays in view.
  useEffect(() => {
    list.current?.querySelector<HTMLElement>("[data-active]")?.scrollIntoView({ block: "nearest" })
  }, [active, items])

  const choose = (index: number) => {
    const item = items[index]
    if (item) command(item)
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
    <div
      ref={list}
      className="bg-popover text-popover-foreground max-h-72 w-64 overflow-y-auto overscroll-contain rounded-md border p-1 shadow-md"
    >
      {items.length === 0 ? (
        <p className="text-muted-foreground px-2 py-1.5 text-sm">No blocks found</p>
      ) : (
        items.map(({ title, hint, icon: Icon }, index) => (
          <button
            key={title}
            type="button"
            // Keeps the cursor in the editor while choosing.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(index)}
            onMouseEnter={() => setActive(index)}
            data-active={index === active || undefined}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
              index === active && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="text-muted-foreground size-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{title}</span>
              <span className="text-muted-foreground block truncate text-xs">{hint}</span>
            </span>
          </button>
        ))
      )}
    </div>
  )
})
