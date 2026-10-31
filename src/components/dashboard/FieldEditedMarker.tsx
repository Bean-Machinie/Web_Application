import { isEdited } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { EditedMarker } from "./EditedMarker"

type Props = { actions: SheetActions; fields: string[]; label: string }

// The Edited marker for a number of the builder's card that the player has typed over on the sheet:
// none when nothing is. Its button clears whichever of these fields is typed over.
export function FieldEditedMarker({ actions, fields, label }: Props) {
  const typed = fields.flatMap((id) => {
    const field = actions.byId.get(id)
    return field && isEdited(field, actions.values) ? [field] : []
  })
  if (typed.length === 0) return null
  const [first]: SheetField[] = typed
  return <EditedMarker calculated={calculatedText(actions, first)} onReset={() => resetPicks(actions, typed.map((field) => field.id), label)} />
}
