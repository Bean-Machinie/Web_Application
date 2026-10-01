import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { richTextClass } from "./rich-text-styles"
import type { FieldViewProps } from "./field-types"

export function RichTextView({ value }: FieldViewProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: value as JSONContent,
    editable: false,
    editorProps: { attributes: { class: richTextClass } },
  })

  return <EditorContent editor={editor} />
}
