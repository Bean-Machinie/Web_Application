import { useContext } from "react"
import { Link } from "react-router-dom"
import type { WorldEntry } from "@/lib/world-entries"
import { useMapPreview } from "@/hooks/use-map-preview"
import { useSeen } from "@/hooks/use-seen"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { useEntryPanel } from "./useEntryPanel"
import { useWorldScope } from "./useWorldScope"
import { WorldTableContext } from "./WorldTableContext"

// The picture, the name with the role under it, and a badge for a hidden entry.
export function WorldNameCell({ entry }: { entry: WorldEntry }) {
  const { selection } = useContext(WorldTableContext)
  const { hasVisibility } = useWorldScope()
  const panel = useEntryPanel()
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]
  const hidden = hasVisibility && !entry.revealed
  // A map with no published image may still have a saved scene, drawn once the row is in view.
  const { ref, seen } = useSeen<HTMLSpanElement>()
  const draft = useMapPreview(entry.id, entry.kind === "map" && !entry.imageUrl && seen, 96)

  return (
    <div className="flex items-center gap-3">
      <span
        ref={ref}
        className={`bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border ${
          hidden ? "opacity-60 grayscale" : ""
        }`}
      >
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : draft.status === "draft" ? (
          <img src={draft.url} alt="" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-5" />
        )}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-0.5">
        <div className="flex max-w-full min-w-0 items-center gap-2">
          <Link
            to={panel.href(entry.id)}
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
          {draft.status === "draft" && <span className="text-muted-foreground shrink-0 text-xs">Draft</span>}
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
