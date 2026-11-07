import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = { icon: LucideIcon; title: string; active: boolean; onShow: () => void; onClose: () => void }

// A tab of the library's detail panel, drawn as the journal's: its icon, the name and a close
// button; the one showing has the page's own colour and the bar across its top. A middle click
// closes it.
export function DetailTab({ icon: Icon, title, active, onShow, onClose }: Props) {
  return (
    <div
      role="tab"
      aria-selected={active}
      onClick={onShow}
      onMouseDown={(event) => event.button === 1 && event.preventDefault()}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onClose()
      }}
      className={cn(
        "group/tab after:bg-primary relative flex h-full max-w-52 min-w-24 shrink-0 cursor-default items-center gap-1.5 border-r px-3 text-xs select-none after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:opacity-0",
        active ? "bg-background text-foreground after:opacity-100" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className={cn("hover:bg-muted flex size-4 shrink-0 items-center justify-center rounded-sm", !active && "opacity-0 group-hover/tab:opacity-100")}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
