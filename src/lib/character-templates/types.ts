export type CharacterFieldType = "stat" | "resource" | "track" | "list" | "text"

// Settings that belong to a field and not to its value.
export type FieldConfig = {
  // A track: how many boxes it has.
  length?: number
}

// A tab of the sheet, and what its empty state says.
export type TemplateTab = { id: string; label: string; empty: string }

// A field the template itself has. Its id is code, never changed or reused: values are
// stored under it.
export type TemplateField = {
  id: string
  tab: string
  section?: string
  type: CharacterFieldType
  label: string
  // Starts as a pill in the header.
  pinned?: boolean
  config?: FieldConfig
}

// What a kind of character sheet looks like. A released version is never edited: a change
// is a new version, with the code that carries older characters over to it.
export type CharacterTemplate = {
  id: string
  version: number
  tabs: TemplateTab[]
  fields: TemplateField[]
}
