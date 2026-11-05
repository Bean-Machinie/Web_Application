import { useState } from "react"
import type { Point } from "@/hooks/use-selection-anchor"
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
// frame; the format bar floats over the screen, above the selected text.
export function PageEditorFrame({ editor, toolbar, entryId }: { editor: Editor; toolbar: boolean; entryId: string }) {
  // Where the right-click menu is open, if it is, for the format bar to line up with.
  const [menuAt, setMenuAt] = useState<Point | null>(null)
  const closeMenu = (open: boolean, viaBar: boolean) => {
    if (open) return
    // A press on the bar closes the menu before the click lands on the button; the bar
    // is kept until the click has.
    if (viaBar) window.addEventListener("click", () => setMenuAt(null), { once: true })
    else setMenuAt(null)
  }
  return (
    <div
      data-mention-root
      className="relative -ml-7 pl-7"
      onContextMenuCapture={(event) => editor.isEditable && setMenuAt({ x: event.clientX, y: event.clientY })}
    >
      {toolbar && <RichTextToolbar editor={editor} />}
      <PageContextMenu editor={editor} onOpenChange={closeMenu}>
        <div>
          <EditorContent editor={editor} />
        </div>
      </PageContextMenu>
      <PageDragHandle editor={editor} />
      <PageFormatBar editor={editor} entryId={entryId} menuAt={menuAt} />
    </div>
  )
}
