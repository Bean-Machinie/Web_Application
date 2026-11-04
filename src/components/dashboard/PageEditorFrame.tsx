import { EditorContent } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import { PageDragHandle } from "./PageDragHandle"
import { RichTextToolbar } from "./RichTextToolbar"

// A page of blocks is not a box: it takes the room it needs and the page
// scrolls. The left padding is the margin the drag handle sits in, and the
// mention and slash menus open inside this frame.
export function PageEditorFrame({ editor, toolbar }: { editor: Editor; toolbar: boolean }) {
  return (
    <div data-mention-root className="relative pl-7">
      {toolbar && <RichTextToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <PageDragHandle editor={editor} />
    </div>
  )
}
