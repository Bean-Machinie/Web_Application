import { Badge } from "@/components/ui/badge"
import type { WorldEntry } from "@/lib/world-entries"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"

type Props = {
  entry: WorldEntry
  disabled: boolean
  onPick: (entry: WorldEntry) => void
}

// An entry as in the world page's grid, a square picture over its name and kind, and a button: one click links
// the marker to it.
export function MarkerEntryCard({ entry, disabled, onPick }: Props) {
  const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(entry)}
      // The world page grid's hover: the card lifts and tilts a touch, with a
      // small overshoot.
      className={cn(
        "bg-card hover:border-foreground/25 focus-visible:ring-ring flex flex-col overflow-hidden rounded-lg border text-left outline-none transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg focus-visible:ring-2 disabled:opacity-60 [@media(hover:hover)]:enabled:hover:-translate-y-1 [@media(hover:hover)]:enabled:hover:-rotate-1 [@media(hover:hover)]:enabled:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100",
        !entry.revealed && "border-dashed"
      )}
    >
      <span className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt=""
            loading="lazy"
            className={cn("size-full object-cover", !entry.revealed && "opacity-60 grayscale")}
          />
        ) : (
          <KindIcon className="size-9" />
        )}
        {!entry.revealed && <HiddenBadge className="absolute top-2 left-2" />}
      </span>
      <span className="flex flex-col gap-2 p-3">
        <span className="truncate font-medium">{entry.name}</span>
        <Badge variant="outline" className="w-fit">
          {label}
        </Badge>
      </span>
    </button>
  )
}
