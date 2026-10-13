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
      className={cn(
        "hover:border-foreground/25 focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border text-left outline-none transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg focus-visible:ring-2 disabled:opacity-60 [@media(hover:hover)]:enabled:hover:-translate-y-1 [@media(hover:hover)]:enabled:hover:-rotate-1 [@media(hover:hover)]:enabled:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100",
        selected ? "bg-primary/10 border-primary ring-primary ring-2 hover:border-primary" : "bg-card"
      )}
    >
      <span className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-9" />
        )}
      </span>
      <span className="flex flex-col gap-2 p-3">
        <span className="truncate font-medium">{entry.name}</span>
        <KindLabel kind={entry.kind} />
      </span>
    </button>
  )

  return <SelectHint kind="dialog">{card}</SelectHint>
}
