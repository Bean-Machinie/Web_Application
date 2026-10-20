import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import type { ClickModifiers } from "@/lib/entry-selection"
import type { WorldEntry } from "@/lib/world-entries"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { KindLabel } from "./KindLabel"
import { SelectHint } from "./SelectHint"

type Props = {
  entry: WorldEntry
  selected: boolean
  disabled: boolean
  // Shift-click takes a range, so the click is passed on.
  onToggle: (entry: WorldEntry, event: ClickModifiers) => void
}

// A library entry as in the world page's grid, a square picture over its name
// and kind. A click picks it or puts it back, so several can be added at once.
export function LibraryPickCard({ entry, selected, disabled, onToggle }: Props) {
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]

  const card = (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-entry-id={entry.id}
      onClick={(event) => onToggle(entry, event)}
      className="focus-visible:ring-ring flex size-full flex-col overflow-hidden rounded-[inherit] text-left outline-none focus-visible:ring-2 disabled:opacity-60"
    >
      <span className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-9" />
        )}
      </span>
      <span className="flex flex-col gap-1 p-3">
        <span className="truncate font-medium">{entry.name}</span>
        <KindLabel kind={entry.kind} />
      </span>
    </button>
  )

  return (
    <TiltCard
      className={cn(
        "rounded-lg border",
        tiltCardSkin(selected ? "selected" : "default"),
        selected ? "bg-primary/10 border-primary ring-primary ring-2" : "bg-card"
      )}
    >
      <SelectHint kind="dialog">{card}</SelectHint>
    </TiltCard>
  )
}
