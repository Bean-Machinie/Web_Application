import { formatNumber } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { CharacterFieldValue } from "./CharacterFieldValue"

type Props = { field: SheetField; actions: SheetActions; tile?: boolean }

// A field's value as it belongs in a row or a tile: worked out and read-only if the
// template derives it, otherwise the control for its type.
export function CharacterFieldBody({ field, actions, tile }: Props) {
  if (field.derived) {
    return (
      <span className={tile ? "block text-center text-xl font-semibold tabular-nums" : "text-sm tabular-nums"}>
        {formatNumber(actions.derived[field.id], field.format === "signed")}
      </span>
    )
  }

  return (
    <CharacterFieldValue
      field={field}
      tile={tile}
      value={actions.values[field.id]?.value ?? null}
      onValue={(value) => actions.onValue(field.id, value)}
      onLength={(length) => actions.onField(field, field.label, { ...field.config, length })}
    />
  )
}
