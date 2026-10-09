import { LayoutGrid } from "lucide-react"
import type { WorldEntry } from "@/lib/world-entries"
import { cn } from "@/lib/utils"
import { WORLD_KINDS, worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = {
  entries: WorldEntry[] | null
  active: WorldEntryKind | null
  onChange: (kind: WorldEntryKind | null) => void
  // On a phone: a row of chips to swipe along, whatever the width.
  compact?: boolean
}

// The world page's kinds, All and one per kind, that filter in place. A
// column beside the entries, which leaves the full height to them; on a phone
// a row above them. Nothing here scrolls on a larger screen, so nothing clips
// the focus ring.
export function MarkerKindTabs({ entries, active, onChange, compact }: Props) {
  const tabs = [null, ...worldKinds]

  return (
    <div
      role="tablist"
      aria-label="Kind of entry"
      aria-orientation="vertical"
      className={cn(
        "no-scrollbar -m-1 flex max-w-full min-w-0 shrink-0 gap-1 overflow-x-auto p-1",
        !compact && "sm:w-48 sm:flex-col sm:overflow-visible"
      )}
    >
      {tabs.map((kind) => {
        const Icon = kind ? WORLD_KINDS[kind].icon : LayoutGrid
        const count = entries && (kind ? entries.filter((entry) => entry.kind === kind).length : entries.length)
        const selected = active === kind
        return (
          <button
            key={kind ?? "all"}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "focus-visible:ring-ring flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2",
              selected
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => onChange(kind)}
          >
            <Icon className="size-4 shrink-0" />
            {kind ? WORLD_KINDS[kind].plural : "All"}
            <span
              className={cn(
                "ml-auto pl-2 text-xs tabular-nums",
                selected ? "text-accent-foreground/70" : "text-muted-foreground/70"
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
