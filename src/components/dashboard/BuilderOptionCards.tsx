import type { OptionDecl } from "@/lib/character-templates/srd-5-2-1-choices"
import { cn } from "@/lib/utils"

type Props = { options: OptionDecl[]; value: string[]; count: number; onChange: (next: string[]) => void; label: string }

// Options the SRD names, each a card with what it does: an order, an ancestry, a lineage.
export function BuilderOptionCards({ options, value, count, onChange, label }: Props) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((other) => other !== id))
    else onChange(count === 1 ? [id] : [...value, id])
  }

  return (
    <div role="group" aria-label={label} className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const on = value.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option.id)}
            className={cn(
              "focus-visible:ring-ring flex flex-col gap-0.5 rounded-lg border px-3.5 py-2.5 text-left outline-none focus-visible:ring-2",
              on ? "border-foreground bg-accent" : "hover:bg-accent/50"
            )}
          >
            <span className="text-sm font-medium">{option.label}</span>
            {option.note && <span className="text-muted-foreground text-xs">{option.note}</span>}
          </button>
        )
      })}
    </div>
  )
}
