import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { tidyMentionSpacing } from "@/lib/mention-spacing"
import { MentionNode } from "./mention-node"
import { richTextClass } from "./rich-text-styles"
import type { FieldViewProps } from "./field-types"

// A mention here is a link to the entry. The database has already turned the
// mentions a player may not follow into plain text.
export function RichTextView({ value }: FieldViewProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), MentionNode],
    content: tidyMentionSpacing(value as JSONContent),
    editable: false,
    editorProps: { attributes: { class: richTextClass } },
  })

  return <EditorContent editor={editor} />
}
