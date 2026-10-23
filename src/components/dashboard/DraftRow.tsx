import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { Draft } from "@/lib/drafts"
import { shortAgo } from "@/lib/time"

// A piece of unfinished work: its picture (or the icon of what it is), its name, what it
// is and when it was last edited, and the way back into the tool that made it.
export function DraftRow({ draft }: { draft: Draft }) {
  const { icon: DraftIcon } = draft

  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <span className="bg-muted text-muted-foreground flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {draft.imageUrl ? (
          <img src={draft.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <DraftIcon className="size-4" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{draft.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {draft.label} · Edited {shortAgo(draft.updatedAt)}
        </span>
      </span>
      <Button asChild variant="ghost" size="sm" className="shrink-0">
        <Link to={draft.to} state={{ fromMap: true }}>
          Open
        </Link>
      </Button>
    </div>
  )
}
