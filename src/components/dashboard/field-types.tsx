import type { ComponentType } from "react"
import type { WorldFieldType } from "@/lib/world-fields"
import { RichTextEditor } from "./RichTextEditor"
import { RichTextView } from "./RichTextView"

export type FieldEditorProps = {
  value: unknown
  label: string
  placeholder?: string
  onChange: (value: unknown) => void
}

export type FieldViewProps = { value: unknown }

// One entry per field type: how a GM edits it, how a player reads it, and
// when it counts as empty. A new type is a new entry here.
export const FIELD_TYPES: Record<
  WorldFieldType,
  {
    Editor: ComponentType<FieldEditorProps>
    View: ComponentType<FieldViewProps>
    isEmpty: (value: unknown) => boolean
  }
> = {
  rich_text: {
    Editor: RichTextEditor,
    View: RichTextView,
    isEmpty: (value) => value == null,
  },
}
