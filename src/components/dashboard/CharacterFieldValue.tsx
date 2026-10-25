import { trackLength } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import { CharacterLineValue } from "./CharacterLineValue"
import { CharacterListValue } from "./CharacterListValue"
import { CharacterResourceValue } from "./CharacterResourceValue"
import { CharacterStatValue } from "./CharacterStatValue"
import { CharacterToggleValue } from "./CharacterToggleValue"
import { CharacterTrackValue } from "./CharacterTrackValue"

type Props = {
  field: SheetField
  value: unknown
  onValue: (value: unknown) => void
  // Bigger and centred, for a tile.
  tile?: boolean
}

// How a field's value is shown and changed, by its type. Text is not here: it is a
// section of its own, drawn by the tab.
export function CharacterFieldValue({ field, value, onValue, tile }: Props) {
  switch (field.type) {
    case "stat":
      return (
        <CharacterStatValue
          value={value}
          label={field.label}
          onChange={(number) => onValue(number === null || !field.range ? number : Math.min(Math.max(number, field.range[0]), field.range[1]))}
          className={tile ? "text-center text-xl font-semibold tabular-nums" : undefined}
        />
      )
    case "resource":
      return <CharacterResourceValue value={value} label={field.label} onChange={onValue} />
    case "track":
      return <CharacterTrackValue value={value} length={trackLength(field)} onChange={onValue} />
    case "list":
      return <CharacterListValue value={value} onChange={onValue} />
    case "toggle":
      return <CharacterToggleValue value={value} label={field.label} onChange={onValue} />
    case "line":
      return <CharacterLineValue value={value} label={field.label} onChange={onValue} />
    case "text":
      return null
  }
}
