import { cn } from "@/lib/utils"
import type { ShownTotal } from "@/hooks/use-dice-roller"

// The result of each roll in play, big over the middle of the tray; it fades in when the dice settle
// and out again. It stays inside the panel and out of the way of the pointer.
export function DiceTotals({ totals }: { totals: ShownTotal[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
      {totals.map(({ roll, visible }) => (
        <span key={roll.id} className={cn("text-7xl font-semibold tabular-nums drop-shadow-lg transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
          {roll.total}
        </span>
      ))}
    </div>
  )
}
