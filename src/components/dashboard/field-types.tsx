import type { ComponentType, ReactNode } from "react"
import type { WorldFieldType } from "@/lib/world-fields"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { ImageFieldView } from "./ImageFieldView"
import { RichTextEditor } from "./RichTextEditor"
import { RichTextView } from "./RichTextView"

export type FieldEditorProps = {
  value: unknown
  label: string
  placeholder?: string
  // What to show in an empty image tile.
  fallback?: ReactNode
  // Where an upload belongs.
  context: { campaignId: string; entryId: string }
  // Resolves to whether the change was saved, for types that save at once.
  onChange: (value: unknown) => void | Promise<boolean>
}

export type FieldViewProps = { value: unknown; fallback?: ReactNode }

// One entry per field type: how a GM edits it, how a player reads it, when it
// counts as empty, and whether a change saves at once or after a pause in
// typing. A new type is a new entry here.
export const FIELD_TYPES: Record<
  WorldFieldType,
  {
    Editor: ComponentType<FieldEditorProps>
    View: ComponentType<FieldViewProps>
    isEmpty: (value: unknown) => boolean
    saveAtOnce: boolean
  }
> = {
  rich_text: {
    Editor: RichTextEditor,
    View: RichTextView,
    isEmpty: (value) => value == null,
    saveAtOnce: false,
  },
  image: {
    Editor: ImageFieldEditor,
    View: ImageFieldView,
    isEmpty: (value) => value == null,
    saveAtOnce: true,
  },
}
