import { RotateCcw } from "lucide-react"

// Marks a calculated value the player has written over; clicking it brings the
// calculated one back.
export function EditedMarker({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      title="Reset to calculated"
      aria-label="Edited. Reset to calculated"
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center gap-0.5 rounded-sm text-[10px] leading-none outline-none focus-visible:ring-2"
    >
      <RotateCcw className="size-2.5" />
      edited
    </button>
  )
}
