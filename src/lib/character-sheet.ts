import type { CharacterFieldType, CharacterTemplate, FieldConfig } from "./character-templates/types"
import type { CustomField, StoredValue } from "./characters"
import { DEFAULT_TRACK_LENGTH } from "./character-values"

// A field of the sheet, whether the template has it or the player added it.
export type SheetField = {
  id: string
  tab: string
  type: CharacterFieldType
  label: string
  config: FieldConfig
  custom: boolean
  pinnedByTemplate: boolean
}

// The template's fields, then the player's, each in its order.
export function sheetFields(template: CharacterTemplate, custom: CustomField[]): SheetField[] {
  return [
    ...template.fields.map((field) => ({
      id: field.id,
      tab: field.tab,
      type: field.type,
      label: field.label,
      config: field.config ?? {},
      custom: false,
      pinnedByTemplate: field.pinned ?? false,
    })),
    ...custom.map((field) => ({
      id: field.id,
      tab: field.tab,
      type: field.type,
      label: field.label,
      config: field.config,
      custom: true,
      pinnedByTemplate: false,
    })),
  ]
}

export const isPinned = (field: SheetField, values: Record<string, StoredValue>) =>
  values[field.id]?.pinned ?? field.pinnedByTemplate

export const trackLength = (field: SheetField) => field.config.length ?? DEFAULT_TRACK_LENGTH

// What a field is called when it is added, until it is named.
export const NEW_FIELD_LABEL: Record<CharacterFieldType, string> = {
  stat: "Stat",
  resource: "Resource",
  track: "Track",
  list: "List",
  text: "Text",
}

// What the Add menu says about each type.
export const FIELD_KINDS: { type: CharacterFieldType; label: string; hint: string }[] = [
  { type: "stat", label: "Stat", hint: "A number, like Strength 16" },
  { type: "resource", label: "Resource", hint: "Current and maximum, like HP" },
  { type: "track", label: "Track", hint: "Boxes to tick, like death saves" },
  { type: "list", label: "List", hint: "Short items, like languages" },
  { type: "text", label: "Text", hint: "Notes, with formatting" },
]
