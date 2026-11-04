import { useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  to: string
  active: boolean
  // Ctrl or Cmd with the click, or the middle button, asks for a new tab.
  onOpen: (mode: "current" | "tab") => void
  // Pressed on the name: it may be dragged out of the tree to open where it is dropped.
  onDragOut: (event: PointerEvent) => void
  // Opened from the row's menu.
  renaming: boolean
  onRename: (title: string) => void
  onDoneRenaming: () => void
}

export const UNTITLED = "Untitled"

// A page's name in the tree: a link to the page, or while it is being renamed a
// box. Enter or leaving the box saves, Escape cancels.
export function JournalRowTitle({ title, to, active, onOpen, onDragOut, renaming, onRename, onDoneRenaming }: Props) {
  const [draft, setDraft] = useState(title)

  function finish(save: boolean) {
    const next = draft.trim()
    onDoneRenaming()
    if (save && next !== title) onRename(next)
  }

  if (renaming) {
    return (
      <input
        aria-label="Page name"
        autoFocus
        maxLength={120}
        value={draft}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") finish(true)
          if (event.key === "Escape") finish(false)
        }}
        className="border-foreground/40 bg-background ring-foreground/10 min-w-0 flex-1 rounded-sm border px-1 py-0.5 text-sm outline-none ring-2"
      />
    )
  }

  return (
    <Link
      to={to}
      // The link's own drag would take the pointer; ours opens a tab.
      draggable={false}
      onPointerDown={(event) => event.button === 0 && onDragOut(event.nativeEvent)}
      onClick={(event) => {
        event.preventDefault()
        onOpen(event.ctrlKey || event.metaKey ? "tab" : "current")
      }}
      onMouseDown={(event) => event.button === 1 && event.preventDefault()}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen("tab")
      }}
      aria-current={active ? "page" : undefined}
      className={cn(
        "min-w-0 flex-1 truncate py-1 text-sm outline-none focus-visible:underline",
        !title && "text-muted-foreground",
        active && "font-medium"
      )}
    >
      {title || UNTITLED}
    </Link>
  )
}
