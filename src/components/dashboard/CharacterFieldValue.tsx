import { trackLength } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import { CharacterListValue } from "./CharacterListValue"
import { CharacterResourceValue } from "./CharacterResourceValue"
import { CharacterStatValue } from "./CharacterStatValue"
import { CharacterTrackValue } from "./CharacterTrackValue"

type Props = {
  field: SheetField
  value: unknown
  onValue: (value: unknown) => void
  // A track's length is part of the field, not of its value.
  onLength: (length: number) => void
}

// How a field's value is shown and changed, by its type. Text is not here: it is a
// section of its own, drawn by the tab.
export function CharacterFieldValue({ field, value, onValue, onLength }: Props) {
  switch (field.type) {
    case "stat":
      return <CharacterStatValue value={value} onChange={onValue} />
    case "resource":
      return <CharacterResourceValue value={value} onChange={onValue} />
    case "track":
      return <CharacterTrackValue value={value} length={trackLength(field)} onChange={onValue} onLength={onLength} />
    case "list":
      return <CharacterListValue value={value} onChange={onValue} />
    case "text":
      return null
  }
}
