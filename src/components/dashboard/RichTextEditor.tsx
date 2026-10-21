import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import { mentionSuggestion } from "./mention-suggestion"
import { MentionNode } from "./mention-node"
import { richTextClass } from "./rich-text-styles"
import { RichTextToolbar } from "./RichTextToolbar"
import { useMentionScope } from "./useMentionScope"
import type { FieldEditorProps } from "./field-types"

// Uncontrolled: `value` only seeds the document, so typing is never
// overwritten by a save coming back. Typing @ offers the entries of the world
// around it, where there is one.
export function RichTextEditor({ value, label, placeholder, context, onChange }: FieldEditorProps) {
  const scope = useMentionScope()
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      scope
        ? MentionNode.configure({ suggestion: mentionSuggestion(scope, context.entryId) })
        : MentionNode,
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
    <div
      data-mention-root
      className="focus-within:border-foreground/40 focus-within:ring-foreground/10 relative rounded-md border focus-within:ring-2"
    >
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
