import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import { richTextClass } from "./rich-text-styles"
import { RichTextToolbar } from "./RichTextToolbar"
import type { FieldEditorProps } from "./field-types"

// Uncontrolled: `value` only seeds the document, so typing is never
// overwritten by a save coming back.
export function RichTextEditor({ value, label, placeholder, onChange }: FieldEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: (value as JSONContent | null) ?? undefined,
    editorProps: {
      attributes: {
        class: `${richTextClass} min-h-36 px-3 py-2.5`,
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? null : e.getJSON()),
  })

  if (!editor) return null

  return (
    <div className="focus-within:border-ring focus-within:ring-ring/50 rounded-md border focus-within:ring-3">
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
