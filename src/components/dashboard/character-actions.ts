import type { Derived } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { FieldConfig } from "@/lib/character-templates/types"
import type { StoredValue } from "@/lib/characters"

// What the parts of a tab need to show and change fields, handed down as one object.
export type SheetActions = {
  characterId: string
  folder: string
  values: Record<string, StoredValue>
  derived: Derived
  byId: Map<string, SheetField>
  // The field just added, whose name is waiting to be typed.
  freshId: string | null
  onValue: (fieldId: string, value: unknown, typing?: boolean) => void
  onField: (field: SheetField, label: string, config: FieldConfig) => void
  onPin: (fieldId: string, pinned: boolean) => void
  onRemove: (fieldId: string) => void
}
