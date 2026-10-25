import { cn } from "@/lib/utils"

export type Chip = {
  id: string
  label: string
  // Hover text.
  note?: string
  // Already held from another source, which is named; it cannot be picked again.
  from?: string
}

type Props = { chips: Chip[]; value: string[]; count: number; onChange: (next: string[]) => void; label: string }

// Pick some of a few things, as chips. With room for one it swaps the pick; with room for
// several, a full set locks the rest until one is let go. A chip held from another source
// is shown as "From <source>" and cannot be picked.
export function BuilderChipPicker({ chips, value, count, onChange, label }: Props) {
  const full = value.length >= count

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((other) => other !== id))
    else onChange(count === 1 ? [id] : [...value, id])
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const on = value.includes(chip.id)
        const disabled = !!chip.from || (!on && full && count > 1)
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            title={chip.from ? `From ${chip.from}` : chip.note}
            onClick={() => toggle(chip.id)}
            className={cn(
              "focus-visible:ring-ring flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-50",
              on ? "bg-foreground text-background border-foreground" : "hover:bg-accent"
            )}
          >
            {chip.label}
            {chip.from && <span className="text-xs opacity-70">From {chip.from}</span>}
          </button>
        )
      })}
    </div>
  )
}
