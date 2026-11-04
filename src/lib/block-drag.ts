import type { Editor } from "@tiptap/react"
import { moveBlock, topLevelBlocks } from "./block-move"
import { debugBlockDrag } from "./block-drag-debug"
import { autoScroll, makeDropLine, makePreview, scrollParent } from "./block-drag-visuals"

const START_PX = 4

// The handle's own lock command exists only when the extension is in the editor,
// and the React handle adds just its plugin. The plugin reads the same
// transaction meta, so it is set directly.
function lockHandle(editor: Editor, locked: boolean) {
  editor.view.dispatch(editor.state.tr.setMeta("lockDragHandle", locked))
}

// Where each gap between the top-level blocks is on screen: the top of the first
// block, the middle of the space between two, the bottom of the last.
function gapLines(editor: Editor) {
  const rects = topLevelBlocks(editor.state.doc).flatMap((block) => {
    const dom = editor.view.nodeDOM(block.pos)
    return dom instanceof HTMLElement ? [dom.getBoundingClientRect()] : []
  })
  if (rects.length === 0) return []
  return [
    rects[0].top,
    ...rects.slice(1).map((rect, i) => (rects[i].bottom + rect.top) / 2),
    rects[rects.length - 1].bottom,
  ]
}

// Moves a block with the pointer, from the handle. Where it lands depends only
// on how high the pointer is: the nearest gap between blocks, whatever the
// pointer's x, so it may stay in the margin and never lands inside a block. Esc
// cancels. Everything it adds to the page is removed when it ends.
export function startBlockDrag(editor: Editor, index: number, start: PointerEvent) {
  const { view } = editor
  const dom = view.nodeDOM(topLevelBlocks(editor.state.doc)[index]?.pos ?? -1)
  const root = view.dom.closest<HTMLElement>("[data-mention-root]")
  if (!(dom instanceof HTMLElement) || !root) return

  const block = dom
  const rect = block.getBoundingClientRect()
  const grab = { x: start.clientX - rect.left, y: start.clientY - rect.top }
  const scroller = scrollParent(block)
  const was = { opacity: block.style.opacity, transition: block.style.transition }
  const pointer = { x: start.clientX, y: start.clientY }
  let live: { preview: HTMLElement; line: HTMLElement } | null = null
  let gap = index
  let frame = 0

  // The handle stays where it is, and cannot start a drag of its own.
  lockHandle(editor, true)
  debugBlockDrag("pointerdown", { index, x: start.clientX, y: start.clientY })

  function begin() {
    debugBlockDrag("drag start", { index })
    live ={ preview: makePreview(block, view.dom.className, rect.width), line: makeDropLine(root!) }
    block.style.transition = "opacity 120ms"
    block.style.opacity = "0.3"
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"
    frame = requestAnimationFrame(tick)
  }

  function update() {
    if (!live) return
    live.preview.style.transform = `translate3d(${pointer.x - grab.x}px, ${pointer.y - grab.y}px, 0)`

    const lines = gapLines(editor)
    if (lines.length === 0) return
    const nearest = lines.reduce((best, y, i) => (Math.abs(y - pointer.y) < Math.abs(lines[best] - pointer.y) ? i : best), 0)
    if (nearest !== gap) debugBlockDrag("target gap", { from: gap, to: nearest })
    gap = nearest

    const box = root!.getBoundingClientRect()
    const editorBox = view.dom.getBoundingClientRect()
    live.line.style.top = `${lines[gap] - box.top - 1}px`
    live.line.style.left = `${editorBox.left - box.left}px`
    live.line.style.width = `${editorBox.width}px`
  }

  function tick() {
    autoScroll(scroller, pointer.y)
    update()
    frame = requestAnimationFrame(tick)
  }

  function move(event: PointerEvent) {
    pointer.x = event.clientX
    pointer.y = event.clientY
    if (!live && Math.hypot(pointer.x - start.clientX, pointer.y - start.clientY) > START_PX) begin()
  }

  function finish(commit: boolean, why: string) {
    debugBlockDrag(commit ? "drop" : "cancel", { why, moved: !!live, index, gap })
    window.removeEventListener("pointermove", move)
    window.removeEventListener("pointerup", up)
    window.removeEventListener("pointercancel", cancel)
    window.removeEventListener("keydown", key, true)
    cancelAnimationFrame(frame)
    live?.preview.remove()
    live?.line.remove()
    block.style.opacity = was.opacity
    block.style.transition = was.transition
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
    lockHandle(editor, false)

    const tr = commit && live ? moveBlock(editor.state, index, gap) : null
    debugBlockDrag("move", tr ? "dispatched" : "nothing to move")
    if (tr) {
      view.dispatch(tr)
      view.focus()
    }
  }

  const up = () => finish(true, "pointerup")
  // The browser took the pointer: a native drag starting does this.
  const cancel = () => finish(false, "pointercancel")
  function key(event: KeyboardEvent) {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    finish(false, "Escape")
  }

  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", up)
  window.addEventListener("pointercancel", cancel)
  window.addEventListener("keydown", key, true)
}
