import { Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DiceStyle } from "@/lib/dice-styles"

type Props = {
  style: DiceStyle
  selected: boolean
  loading: boolean
  // Where the 3D die is drawn, in the canvas laid over the grid.
  area: (element: HTMLElement | null) => void
  onSelect: () => void
  onHover: (hovered: boolean) => void
}

// One style: its d20 and its name, on a card of its own. The selected card is ringed
// and checked like the theme cards; a hovered one lifts a little while its die turns.
export function DiceStyleCard({ style, selected, loading, area, onSelect, onHover }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      className="group border-border bg-muted/30 hover:border-foreground/30 focus-visible:ring-ring ring-offset-popover aria-checked:border-primary aria-checked:ring-primary relative flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border p-2 text-center outline-none transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 aria-checked:ring-2 motion-reduce:hover:translate-y-0"
    >
      <div ref={area} className="relative aspect-square w-[88%]">
        {/* The soft shadow under a hovered die, as in the panel's tray. */}
        <span
          aria-hidden
          className="absolute bottom-[9%] left-1/2 h-[10%] w-3/5 -translate-x-1/2 rounded-full bg-black/50 opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        {loading && <Skeleton className="absolute inset-[12%] rounded-lg" />}
      </div>
      <span className="text-sm font-medium">{style.label}</span>
      <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 hidden size-4 items-center justify-center rounded-full group-aria-checked:flex">
        <Check className="size-3" strokeWidth={3} />
      </span>
    </button>
  )
}
