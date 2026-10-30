import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { PickOption } from "@/lib/pick-options"
import { cn } from "@/lib/utils"

type Props = { option: PickOption; selected: boolean; single: boolean; onToggle: () => void; onPreview: (on: boolean) => void }

// One option of a pick as a compact row: a radio when one is picked, a checkbox when several,
// the name, a Recommended badge where the SRD names one, and its note or, if another source
// holds it already, the reason it cannot be taken ("From Criminal"). Hovering or focusing it
// previews it on the character.
export function PickOptionRow({ option, selected, single, onToggle, onPreview }: Props) {
  const reason = option.disabled
  return (
    <button
      type="button"
      role={single ? "radio" : "checkbox"}
      aria-checked={selected}
      disabled={!!reason}
      onClick={onToggle}
      onMouseEnter={() => onPreview(true)}
      onMouseLeave={() => onPreview(false)}
      onFocus={() => onPreview(true)}
      onBlur={() => onPreview(false)}
      className={cn(
        "focus-visible:ring-ring flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left outline-none focus-visible:ring-2 disabled:cursor-default disabled:opacity-55",
        selected ? "border-foreground bg-accent" : "enabled:hover:bg-accent/50"
      )}
    >
      <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center border", single ? "rounded-full" : "rounded-sm", selected && "bg-foreground text-background border-foreground")}>
        {selected && <Check className="size-3" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{option.label}</span>
          {option.recommended && <Badge variant="secondary">Recommended</Badge>}
        </span>
        {(reason ?? option.note) && <span className="text-muted-foreground text-xs">{reason ?? option.note}</span>}
      </span>
    </button>
  )
}
