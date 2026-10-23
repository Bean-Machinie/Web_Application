import type { Formula } from "./character-templates/formulas"
import type {
  CharacterFieldType,
  CharacterTemplate,
  FieldConfig,
  TemplateSection,
  TemplateTab,
} from "./character-templates/types"
import type { CustomField, StoredValue } from "./characters"
import { DEFAULT_TRACK_LENGTH, isEmptyValue } from "./character-values"

// A field of the sheet, whether the template has it or the player added it.
export type SheetField = {
  id: string
  tab: string
  // The template's section it is in; the fields a player adds are in none.
  section: string | null
  type: CharacterFieldType
  label: string
  hint?: string
  caption?: string
  config: FieldConfig
  custom: boolean
  pinnedByTemplate: boolean
  derived?: Formula
  format?: "signed"
  secondary?: string
}

// The template's fields, then the player's, each in its order.
export function sheetFields(template: CharacterTemplate, custom: CustomField[]): SheetField[] {
  return [
    ...template.fields.map((field) => ({
      id: field.id,
      tab: field.tab,
      section: field.section ?? null,
      type: field.type,
      label: field.label,
      hint: field.hint,
      caption: field.caption,
      config: field.config ?? {},
      custom: false,
      pinnedByTemplate: field.pinned ?? false,
      derived: field.derived,
      format: field.format,
      secondary: field.secondary,
    })),
    ...custom.map((field) => ({
      id: field.id,
      tab: field.tab,
      section: null,
      type: field.type,
      label: field.label,
      config: field.config,
      custom: true,
      pinnedByTemplate: false,
    })),
  ]
}

// The fields of the sections that live in the profile column, in order.
export function profileFields(template: CharacterTemplate, fields: SheetField[]) {
  const ids = new Set(template.sections.filter((section) => section.profile).map((section) => section.id))
  return fields.filter((field) => field.section !== null && ids.has(field.section))
}

// A tab's contents: its sections with their fields, and the fields in none (the player's,
// and the template's own that stand alone). Fields shown inside another's tile or row are
// left out of both.
export type TabContents = {
  sections: { section: TemplateSection; fields: SheetField[] }[]
  loose: SheetField[]
}

export function tabContents(template: CharacterTemplate, tab: TemplateTab, fields: SheetField[]): TabContents {
  const inTab = fields.filter((field) => field.tab === tab.id)
  const nested = new Set(inTab.map((field) => field.secondary).filter(Boolean))
  const shown = inTab.filter((field) => !nested.has(field.id))
  return {
    sections: template.sections
      .filter((section) => section.tab === tab.id && !section.profile)
      .map((section) => ({ section, fields: shown.filter((field) => field.section === section.id) })),
    loose: shown.filter((field) => field.section === null),
  }
}

// Whether any of a section's fields has been filled in, which keeps it open.
export function sectionStarted(fieldsOfSection: SheetField[], values: Record<string, StoredValue>) {
  return fieldsOfSection.some((field) => !field.derived && !isEmptyValue(field.type, values[field.id]?.value))
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
  toggle: "Toggle",
  line: "Line",
}

// What the Add menu says about each type.
export const FIELD_KINDS: { type: CharacterFieldType; label: string; hint: string }[] = [
  { type: "stat", label: "Stat", hint: "A number, like Strength 16" },
  { type: "resource", label: "Resource", hint: "Current and maximum, like HP" },
  { type: "track", label: "Track", hint: "Boxes to tick, like death saves" },
  { type: "toggle", label: "Toggle", hint: "On or off, like proficient" },
  { type: "line", label: "Line", hint: "One line of text, like alignment" },
  { type: "list", label: "List", hint: "Short items, like languages" },
  { type: "text", label: "Text", hint: "Notes, with formatting" },
]
