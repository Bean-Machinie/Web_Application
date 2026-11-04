import { useRef, useState } from "react"
import DragHandle from "@tiptap/extension-drag-handle-react"
import { GripVertical } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { startBlockDrag } from "@/lib/block-drag"
import { debugBlockDrag } from "@/lib/block-drag-debug"
import { blockIndexAt } from "@/lib/block-move"

const HIT_PX = 24

// Appears in the left margin beside the block the pointer is over. The extension
// only places it; dragging is ours (lib/block-drag), so the drop line, the
// preview and the scrolling are not the browser's. The hit area is 24px, and
// centred on the block's first line.
export function PageDragHandle({ editor }: { editor: Editor }) {
  const hovered = useRef<number | null>(null)
  const [shift, setShift] = useState(0)

  // A native drag from the handle would fight ours.
  const stopNativeDrag = (node: HTMLDivElement | null) => {
    const handle = node?.parentElement
    const stop = (event: Event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    handle?.addEventListener("dragstart", stop, true)
    return () => handle?.removeEventListener("dragstart", stop, true)
  }

  return (
    <DragHandle
      editor={editor}
      onNodeChange={({ node, pos }) => {
        if (!node) return
        hovered.current = pos
        const dom = editor.view.nodeDOM(pos)
        if (!(dom instanceof HTMLElement)) return
        const style = getComputedStyle(dom)
        const line = parseFloat(style.lineHeight) || HIT_PX
        setShift(Math.round(parseFloat(style.paddingTop) + (line - HIT_PX) / 2))
      }}
    >
      <div
        ref={stopNativeDrag}
        aria-label="Drag to move"
        style={{ height: HIT_PX, width: HIT_PX, marginTop: shift }}
        className="flex cursor-grab touch-none items-center justify-start active:cursor-grabbing"
        onMouseDown={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          debugBlockDrag("handle pointerdown", { button: event.button, hovered: hovered.current })
          if (event.button !== 0 || hovered.current === null) return
          event.preventDefault()
          // The extension makes its element draggable; that would start a native drag.
          const handle = event.currentTarget.parentElement
          if (handle) handle.draggable = false
          event.currentTarget.setPointerCapture(event.pointerId)
          startBlockDrag(editor, blockIndexAt(editor.state.doc, hovered.current), event.nativeEvent)
        }}
      >
        <span className="text-muted-foreground hover:bg-muted flex h-6 w-5 items-center justify-center rounded">
          <GripVertical className="size-4" />
        </span>
      </div>
    </DragHandle>
  )
}
