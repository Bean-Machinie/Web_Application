import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  selected: boolean
  onSelect: () => void
  // The picture of the choice.
  children: ReactNode
}

// One choice among a few, shown as a picture with its name under it.
export function PreviewOption({ label, selected, onSelect, children }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-sm outline-none transition-colors",
        "hover:bg-accent focus-visible:ring-ring focus-visible:ring-2",
        selected && "border-primary ring-primary bg-accent ring-1"
      )}
    >
      {children}
      <span className={selected ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </button>
  )
}
