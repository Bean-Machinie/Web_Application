import { formatNumber } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import { EditedMarker } from "./EditedMarker"
import { InlineText } from "./InlineText"

type Props = {
  field: SheetField
  // The calculated number, or the player's own when they have written over it.
  shown: number | null
  edited: boolean
  tile?: boolean
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
export function CharacterDerivedValue({ field, shown, edited, tile, onEnter, onReset }: Props) {
  function save(text: string) {
    const typed = typedNumber(text, field.range)
    if (text === "") onReset()
    else if (typed !== null) onEnter(typed)
  }

  return (
    <span className={`flex items-center gap-1.5 ${tile ? "justify-center" : ""}`}>
      <span className={tile ? "w-16" : "w-14"}>
        <InlineText
          value={shown === null ? "" : String(shown)}
          display={formatNumber(shown, field.format)}
          placeholder="—"
          label={field.label}
          inputMode="numeric"
          allowEmpty
          maxLength={7}
          onSave={save}
          className={tile ? "text-center text-xl font-semibold tabular-nums" : "tabular-nums"}
        />
      </span>
      {edited && <EditedMarker onReset={onReset} />}
    </span>
  )
}
