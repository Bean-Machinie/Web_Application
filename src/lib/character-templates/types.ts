import type { Formula } from "./formulas"

// The types the database knows, which a player can add to any sheet.
export type CharacterFieldType = "stat" | "resource" | "track" | "list" | "text" | "toggle" | "line"

// True while the choice field has one of these options.
export type Condition = { field: string; is: string | string[] }

// What a template's own fields can also be. These are never in the database's enum: a
// field of the player's is always one of CharacterFieldType.
// - choice: the id of one option from a list the template declares.
// - attacks: a list of attacks, each with its own name, ability and damage.
export type SheetFieldType = CharacterFieldType | "choice" | "attacks"

export type ChoiceOption = { id: string; label: string }

// The options of a choice field: one list, or a list for each option of another choice
// field (the ability increases a background offers).
export type ChoiceList = { options: ChoiceOption[] } | { by: string; options: Record<string, ChoiceOption[]> }

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
  layout?: "list" | "grid" | "abilities"
  // A grid's tiles across; for a list, how many columns of rows. More than one makes the
  // section as wide as the tab.
  columns?: number
  // What the collapsed card says is inside, like "6 scores"; by default the number of fields.
  summary?: string
  // Shown in the profile column beside the tabs (always open), not in its tab.
  profile?: boolean
  // A line under the heading once the section is open; `{n}` is the number of the field.
  // Nothing shows while the field has none.
  caption?: { field: string; text: string }
  // A button in the heading that opens a helper of its own.
  helper?: "ability-scores" | "background-increase"
}

// A field the template itself has. Its id is code, never changed or reused: values are
// stored under it.
export type TemplateField = {
  id: string
  tab: string
  section?: string
  type: SheetFieldType
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
  // Worked out from other fields and shown unless the player enters their own, which is
  // stored under the field's id. The calculated value itself is never stored. For a
  // toggle, anything above 0 is on; for a choice, it is an `option` formula.
  derived?: Formula
  // How a number reads: "signed" shows +2 and -1, "die" d10, "feet" 30 ft.
  format?: "signed" | "die" | "feet" | "pounds"
  // The options of a choice field.
  choices?: ChoiceList
  // A number typed in is kept within these.
  range?: [number, number]
  // The field is only shown while this one has a value.
  showWhen?: string
  // The field is only shown while all of these hold.
  showIf?: Condition[]
  // A derived field the sheet fixes (the origin feat a background gives): shown as plain
  // text, with `source` the choice it comes from. Unless `overrideLabel` is set it cannot be
  // changed; with it, the field's menu offers that, and the field then shows as edited.
  locked?: boolean
  overrideLabel?: string
  source?: string
  // A short note beside the label while all of these hold, like "from Human".
  note?: { text: string; when: Condition[] }
  // Marks the field out when this field is above 0, like a skill the class offers.
  highlight?: string
  // Only there for other fields to read, like a maximum shown in a resource's own control.
  hidden?: boolean
  // A resource whose maximum is this field's value, not part of its own.
  maxFrom?: string
  // Another field shown inside this one's tile or row (and nowhere else): a score's
  // modifier, a skill's total.
  secondary?: string
  // A second one, shown beside the first under a tile's value: a score's total and modifier.
  tertiary?: string
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
