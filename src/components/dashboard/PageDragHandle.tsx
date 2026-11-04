import { useEffect, useRef, useState } from "react"
import { GripVertical } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { blockAtY } from "@/lib/block-at"
import { startBlockDrag } from "@/lib/block-drag"
import { debugBlockDrag } from "@/lib/block-drag-debug"

const HIT_PX = 24

type Target = { index: number; top: number }

// The handle in the left margin. Which block it is beside depends only on how
// high the pointer is in the page, however far left or right: nothing has to be
// hovered, and it stays until the pointer leaves the page. A block shorter than
// the handle (a divider) has it centred on it; otherwise it sits on the first
// line. Dragging is ours (lib/block-drag), not the browser's.
export function PageDragHandle({ editor }: { editor: Editor }) {
  const [target, setTarget] = useState<Target | null>(null)
  const lastY = useRef<number | null>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const root = editor.view.dom.closest<HTMLElement>("[data-mention-root]")
    if (!root) return

    function locate() {
      if (lastY.current === null) return
      const hit = blockAtY(editor, lastY.current)
      if (!hit) return setTarget(null)
      const style = getComputedStyle(hit.dom)
      const line = parseFloat(style.lineHeight) || HIT_PX
      const inset = hit.height < HIT_PX ? (hit.height - HIT_PX) / 2 : parseFloat(style.paddingTop) + (line - HIT_PX) / 2
      const top = Math.round(hit.top - root!.getBoundingClientRect().top + inset)
      setTarget((old) => (old?.index === hit.index && old.top === top ? old : { index: hit.index, top }))
    }
    const move = (event: PointerEvent) => {
      if (dragging.current || event.pointerType === "touch") return
      lastY.current = event.clientY
      locate()
    }
    const leave = () => {
      if (dragging.current) return
      lastY.current = null
      setTarget(null)
    }

    root.addEventListener("pointermove", move)
    root.addEventListener("pointerleave", leave)
    // Typing moves the blocks under a pointer that has not moved.
    editor.on("update", locate)
    return () => {
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerleave", leave)
      editor.off("update", locate)
    }
  }, [editor])

  if (!target) return null

  return (
    <div
      aria-label="Drag to move"
      style={{ top: target.top, height: HIT_PX, width: HIT_PX }}
      className="absolute left-0 z-10 flex cursor-grab touch-none items-center justify-start active:cursor-grabbing"
      onMouseDown={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        debugBlockDrag("handle pointerdown", { button: event.button, index: target.index })
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        dragging.current = true
        startBlockDrag(editor, target.index, event.nativeEvent, () => {
          dragging.current = false
          setTarget(null)
        })
      }}
    >
      <span className="text-muted-foreground hover:bg-muted flex h-6 w-5 items-center justify-center rounded">
        <GripVertical className="size-4" />
      </span>
    </div>
  )
}
