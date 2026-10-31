import { formatNumber } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import { EditedMarker } from "./EditedMarker"
import { InlineText } from "./InlineText"

type Props = {
  field: SheetField
  // The calculated number, or the player's own when they have written over it.
  shown: number | null
  edited: boolean
  // What the calculation gives, for the reset button's tooltip.
  calculated: string | null
  tile?: boolean
  // A small box with the number centred, like an ability’s score; the edited marker sits under it.
  box?: boolean
  // A number the player typed; reset brings the calculated one back.
  onEnter: (value: number) => void
  onReset: () => void
}

// The first whole number in what was typed, so "+2", "d10" and "30 ft" all work.
function typedNumber(text: string, range?: [number, number]) {
  const found = text.match(/-?\d+(\.\d+)?/)
  if (!found) return null
  const whole = Math.round(Number(found[0]))
  return range ? Math.min(Math.max(whole, range[0]), range[1]) : whole
}

// A calculated number, typed over when clicked. Clearing the box goes back to the calculated
// one.
export function CharacterDerivedValue({ field, shown, edited, calculated, tile, box, onEnter, onReset }: Props) {
  function save(text: string) {
    const typed = typedNumber(text, field.range)
    if (text === "") onReset()
    else if (typed !== null) onEnter(typed)
  }

  return (
    <span className={`relative flex items-center gap-1.5 ${tile || box ? "justify-center" : ""}`}>
      <span className={box ? "w-8" : tile ? "w-16" : "w-14"}>
        <InlineText
          value={shown === null ? "" : String(shown)}
          display={formatNumber(shown, field.format)}
          placeholder="—"
          label={field.label}
          inputMode="numeric"
          allowEmpty
          maxLength={7}
          onSave={save}
          className={box ? "min-h-4 !py-0 text-center text-xs font-medium tabular-nums" : tile ? "text-center text-xl font-semibold tabular-nums" : "tabular-nums"}
        />
      </span>
      {edited && (
        <span className={box ? "absolute top-full left-1/2 mt-2.5 -translate-x-1/2" : undefined}>
          <EditedMarker calculated={calculated} onReset={onReset} />
        </span>
      )}
    </span>
  )
}
