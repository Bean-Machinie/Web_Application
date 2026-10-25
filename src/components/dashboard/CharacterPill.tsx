import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { explain } from "@/lib/character-glossary"
import { GlossaryLabel } from "./GlossaryLabel"
import { pillValue } from "@/lib/character-values"
import type { ResourceValue } from "@/lib/character-values"
import { trackLength } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { calculatedResource } from "./character-resource"
import { CharacterFieldValue } from "./CharacterFieldValue"

type Props = { field: SheetField; actions: SheetActions }

// A pinned field in the header, as a compact pill: "HP 24/31". Clicking it opens the same
// control the field has on its tab, so a resource can be spent without leaving the top.
export function CharacterPill({ field, actions }: Props) {
  // A resource with a calculated maximum shows the figure the sheet uses.
  const calculated = field.maxFrom ? calculatedResource(field, actions) : null
  const value = calculated ? calculated.value : (actions.values[field.id]?.value ?? null)
  const onValue = (next: unknown) => (calculated ? calculated.onChange(next as ResourceValue) : actions.onValue(field.id, next))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="bg-card hover:bg-accent focus-visible:ring-ring flex h-7 items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <GlossaryLabel explanation={explain(field, actions)}>
            <span className="text-muted-foreground">{field.label}</span>
          </GlossaryLabel>
          <span className="font-medium tabular-nums">{pillValue(field.type, value, trackLength(field))}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto min-w-48 p-3">
        <p className="text-muted-foreground mb-2 text-xs font-medium">{field.label}</p>
        <CharacterFieldValue field={field} value={value} onValue={onValue} />
      </PopoverContent>
    </Popover>
  )
}
