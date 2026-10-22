import { useContext } from "react"
import { Link } from "react-router-dom"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { useWorldScope } from "./useWorldScope"
import { WorldTableContext } from "./WorldTableContext"

// The picture, the name with the role under it, and a badge for a hidden entry.
export function WorldNameCell({ entry }: { entry: WorldEntry }) {
  const { selection } = useContext(WorldTableContext)
  const { basePath, hasVisibility } = useWorldScope()
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]
  const hidden = hasVisibility && !entry.revealed

  return (
    <div className="flex items-center gap-3">
      <span
        className={`bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border ${
          hidden ? "opacity-60 grayscale" : ""
        }`}
      >
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-5" />
        )}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-0.5">
        <div className="flex max-w-full min-w-0 items-center gap-2">
          <Link
            to={`${basePath}/${entry.id}`}
            onClick={(event) => {
              if (!selection) return
              if (selection.active || event.shiftKey || event.ctrlKey || event.metaKey) {
                event.preventDefault()
                selection.click(entry.id, event)
              }
            }}
            className="focus-visible:ring-ring truncate rounded-sm font-medium outline-none focus-visible:ring-2"
          >
            {entry.name}
          </Link>
          {hidden && <HiddenBadge className="shrink-0" />}
        </div>
        {entry.role && (
          <span className="text-muted-foreground max-w-full truncate text-xs">{entry.role}</span>
        )}
        <KindLabel kind={entry.kind} className="md:hidden" />
      </div>
    </div>
  )
}
