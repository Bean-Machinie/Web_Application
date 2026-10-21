import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import { tidyMentionSpacing } from "@/lib/mention-spacing"
import { cn } from "@/lib/utils"
import { RICH_TEXT_BOX_HEIGHT, THIN_SCROLL } from "./entry-layout"
import { mentionSuggestion } from "./mention-suggestion"
import { MentionNode } from "./mention-node"
import { richTextClass } from "./rich-text-styles"
import { RichTextToolbar } from "./RichTextToolbar"
import { useMentionScope } from "./useMentionScope"
import type { FieldEditorProps } from "./field-types"

// Uncontrolled: `value` only seeds the document, so typing is never
// overwritten by a save coming back. Typing @ offers the entries of the world
// around it, where there is one. The box is one fixed height, the same for every
// rich text field: the toolbar stays at the top and the text scrolls beneath it.
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
    content: value ? tidyMentionSpacing(value as JSONContent) : undefined,
    editorProps: {
      attributes: {
        class: `${richTextClass} px-3 py-2.5`,
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? null : e.getJSON()),
  })

  if (!editor) return null

  // The box does not clip: the mention picker opens inside it and may reach past
  // its edge. Only the text area scrolls.
  return (
    <div
      data-mention-root
      className={cn(
        "focus-within:border-foreground/40 focus-within:ring-foreground/10 relative flex flex-col rounded-md border focus-within:ring-2",
        RICH_TEXT_BOX_HEIGHT
      )}
    >
      <RichTextToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto [&_.ProseMirror]:min-h-full",
          THIN_SCROLL
        )}
      />
    </div>
  )
}
