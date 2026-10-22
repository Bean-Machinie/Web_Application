import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { cn } from "@/lib/utils"

export type Legend = {
  kinds: WorldEntryKind[]
  hidden: ReadonlySet<WorldEntryKind>
  onToggle: (kind: WorldEntryKind) => void
}

// The kinds and their colours; a click shows or hides the kind in the graph.
export function GraphKindLegend({ kinds, hidden, onToggle }: Legend) {
  return (
    <ul className="-mx-1.5 grid gap-0.5">
      {kinds.map((kind) => {
        const { label, tint } = WORLD_KINDS[kind]
        const off = hidden.has(kind)
        return (
          <li key={kind}>
            <button
              type="button"
              aria-pressed={!off}
              onClick={() => onToggle(kind)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs"
            >
              <span
                className="size-2.5 shrink-0 rounded-full border"
                style={{ borderColor: tint, background: off ? "transparent" : tint }}
              />
              <span className={cn(off && "text-muted-foreground line-through")}>{label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
