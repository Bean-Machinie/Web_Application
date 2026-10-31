import { isEdited } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { CharacterAttacksValue } from "./CharacterAttacksValue"
import { CharacterCalculatedResource } from "./CharacterCalculatedResource"
import { CharacterChoiceValue } from "./CharacterChoiceValue"
import { CharacterDerivedToggle } from "./CharacterDerivedToggle"
import { CharacterDerivedValue } from "./CharacterDerivedValue"
import { CharacterLockedChoice } from "./CharacterLockedChoice"
import { CharacterFieldValue } from "./CharacterFieldValue"

type Props = { field: SheetField; actions: SheetActions; tile?: boolean }

// A field's value as it belongs in a row or a tile: the control for its type. A field the
// template works out shows its calculated value in the same control; anything the player
// enters is stored under the field's id, and clearing it (reset) removes it.
export function CharacterFieldBody({ field, actions, tile }: Props) {
  const edited = isEdited(field, actions.values)
  const calculated = edited ? calculatedText(actions, field) : null
  const reset = () => resetPicks(actions, [field.id], field.label)

  if (field.type === "choice") {
    return field.locked && !isEdited(field, actions.values) ? (
      <CharacterLockedChoice field={field} actions={actions} />
    ) : (
      <CharacterChoiceValue field={field} actions={actions} />
    )
  }
  if (field.type === "attacks") return <CharacterAttacksValue field={field} actions={actions} />
  if (field.maxFrom) return <CharacterCalculatedResource field={field} actions={actions} />

  if (field.derived && field.type === "toggle") {
    return (
      <CharacterDerivedToggle
        label={field.label}
        on={(actions.derived[field.id] ?? 0) > 0}
        edited={edited}
        calculated={calculated}
        onChange={(on) => actions.onValue(field.id, on)}
        onReset={reset}
      />
    )
  }

  if (field.derived) {
    return (
      <CharacterDerivedValue
        field={field}
        shown={actions.derived[field.id] ?? null}
        edited={edited}
        calculated={calculated}
        tile={tile}
        onEnter={(value) => actions.onValue(field.id, value)}
        onReset={reset}
      />
    )
  }

  return (
    <CharacterFieldValue
      field={field}
      tile={tile}
      value={actions.values[field.id]?.value ?? null}
      onValue={(value) => actions.onValue(field.id, value)}
    />
  )
}
