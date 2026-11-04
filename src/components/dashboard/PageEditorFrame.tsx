import { EditorContent } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import { PageDragHandle } from "./PageDragHandle"
import { PageContextMenu } from "./PageContextMenu"
import { PageFormatBar } from "./PageFormatBar"
import { RichTextToolbar } from "./RichTextToolbar"

// A page of blocks is not a box: it takes the room it needs and the page scrolls.
// The frame reaches into the margin to the left and is padded back by the same, so the
// text lines up with the title above it, while the drag handle, and the pointer that
// finds it, have the margin to sit in. The mention and slash menus open inside this
// frame; the format bar rises over the screen when text is selected.
export function PageEditorFrame({ editor, toolbar }: { editor: Editor; toolbar: boolean }) {
  return (
    <div data-mention-root className="relative -ml-7 pl-7">
      {toolbar && <RichTextToolbar editor={editor} />}
      <PageContextMenu editor={editor}>
        <div>
          <EditorContent editor={editor} />
        </div>
      </PageContextMenu>
      <PageDragHandle editor={editor} />
      <PageFormatBar editor={editor} />
    </div>
  )
}
