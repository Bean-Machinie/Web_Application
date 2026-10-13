import { Check } from "lucide-react"
import type { WorldEntry } from "@/lib/world-entries"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { KindLabel } from "./KindLabel"

type Props = {
  entry: WorldEntry
  selected: boolean
  disabled: boolean
  onToggle: (entry: WorldEntry) => void
}

// A library entry as in the world page's grid, a square picture over its name
// and kind. A click picks it or puts it back, so several can be added at once.
export function LibraryPickCard({ entry, selected, disabled, onToggle }: Props) {
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle(entry)}
      className={cn(
        "bg-card hover:border-foreground/25 focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border text-left outline-none transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg focus-visible:ring-2 disabled:opacity-60 [@media(hover:hover)]:enabled:hover:-translate-y-1 [@media(hover:hover)]:enabled:hover:-rotate-1 [@media(hover:hover)]:enabled:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100",
        selected && "border-primary ring-primary ring-2 hover:border-primary"
      )}
    >
      <span className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-9" />
        )}
        {selected && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-6 items-center justify-center rounded-full shadow">
            <Check className="size-4" />
          </span>
        )}
      </span>
      <span className="flex flex-col gap-2 p-3">
        <span className="truncate font-medium">{entry.name}</span>
        <KindLabel kind={entry.kind} />
      </span>
    </button>
  )
}
