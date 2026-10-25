import type { useCharacter } from "@/hooks/use-character"
import type { SheetActions } from "./character-actions"

// What the parts of a sheet or of the builder need to show and change fields, from the
// character hook.
export function sheetActions(
  sheet: ReturnType<typeof useCharacter>,
  characterId: string,
  folder: string,
  freshId: string | null = null
): SheetActions {
  return {
    characterId,
    folder,
    values: sheet.values,
    derived: sheet.derived,
    byId: new Map(sheet.fields.map((field) => [field.id, field])),
    freshId,
    onValue: sheet.setValue,
    onField: (field, label, config) => sheet.changeField(field.id, label, config),
    onPin: (fieldId, pinned) => sheet.setPinned(fieldId, pinned),
    onRemove: (fieldId) => sheet.removeField(fieldId),
  }
}
