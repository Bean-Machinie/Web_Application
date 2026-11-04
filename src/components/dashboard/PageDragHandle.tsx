import DragHandle from "@tiptap/extension-drag-handle-react"
import { GripVertical } from "lucide-react"
import type { Editor } from "@tiptap/react"

// Appears in the left margin beside the block the pointer is over; dragging it
// moves the block.
export function PageDragHandle({ editor }: { editor: Editor }) {
  return (
    <DragHandle editor={editor}>
      <div
        aria-label="Drag to move"
        className="text-muted-foreground hover:bg-muted mr-1 flex h-6 w-5 cursor-grab items-center justify-center rounded active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </div>
    </DragHandle>
  )
}
