import type { Formula } from "./formulas"

export type CharacterFieldType = "stat" | "resource" | "track" | "list" | "text" | "toggle" | "line"

// Settings that belong to a field and not to its value.
export type FieldConfig = {
  // A track: how many boxes it has.
  length?: number
}

// A tab of the sheet, and what its empty state says.
export type TemplateTab = { id: string; label: string; empty: string }

// A named part of a tab. It starts as one collapsed row, "Label · summary · Set up", and
// opens to its fields, as a list of rows or as a grid of tiles.
export type TemplateSection = {
  id: string
  tab: string
  label: string
  layout?: "list" | "grid"
  // A grid's tiles across; for a list, how many columns of rows. More than one makes the
  // section as wide as the tab.
  columns?: number
  // What the collapsed card says is inside, like "6 scores"; by default the number of fields.
  summary?: string
  // Shown in the profile column beside the tabs (always open), not in its tab.
  profile?: boolean
}

// A field the template itself has. Its id is code, never changed or reused: values are
// stored under it.
export type TemplateField = {
  id: string
  tab: string
  section?: string
  type: CharacterFieldType
  label: string
  // Small muted text beside the label, like the ability a skill uses.
  hint?: string
  // The full name when the label is a shortened one; shown as a tooltip.
  title?: string
  // Small text before the control, for a pair sharing a row: "Successes", "Failures".
  caption?: string
  // Starts as a pill in the header (once it has a value).
  pinned?: boolean
  config?: FieldConfig
  // Worked out from other fields: read-only, never stored.
  derived?: Formula
  // How a number reads: "signed" shows +2 and -1.
  format?: "signed"
  // Another field shown inside this one's tile or row (and nowhere else): a score's
  // modifier, a skill's total.
  secondary?: string
}

// What a kind of character sheet looks like. A released version is never edited: a change
// is a new version, with the code that carries older characters over to it.
export type CharacterTemplate = {
  id: string
  version: number
  tabs: TemplateTab[]
  sections: TemplateSection[]
  fields: TemplateField[]
}
