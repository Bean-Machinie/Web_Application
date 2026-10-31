import { isEdited } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { calculatedResource } from "./character-resource"
import { CharacterResourceValue } from "./CharacterResourceValue"
import { EditedMarker } from "./EditedMarker"

// Hit points and hit dice: current is typed or stepped, the maximum is the sheet's own
// figure until the player writes over it.
export function CharacterCalculatedResource({ field, actions }: { field: SheetField; actions: SheetActions }) {
  const { value, onChange } = calculatedResource(field, actions)
  const maxField = actions.byId.get(field.maxFrom!)

  return (
    <span className="flex items-center gap-2">
      <CharacterResourceValue value={value} label={field.label} onChange={onChange} />
      {maxField && isEdited(maxField, actions.values) && (
        <EditedMarker calculated={calculatedText(actions, maxField)} onReset={() => resetPicks(actions, [maxField.id], maxField.label)} />
      )}
    </span>
  )
}
