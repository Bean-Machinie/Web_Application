import { NodeSelection } from "@tiptap/pm/state"
import type { Editor } from "@tiptap/react"
import { gapLines } from "./block-at"
import { debugBlockDrag } from "./block-drag-debug"
import { autoScroll, makeDropLine, makePreview, scrollParent } from "./block-drag-visuals"
import { moveBlock, topLevelBlocks } from "./block-move"

const START_PX = 4

// Moves a block with the pointer, from the handle. Where it lands depends only
// on how high the pointer is: the nearest gap between blocks, whatever the
// pointer's x, so it may stay in the margin and never lands inside a block. Esc
// cancels. A click that does not move selects the block instead, which is how a
// divider is picked to be deleted. Everything it adds to the page is removed when
// it ends, and onEnd is called then.
export function startBlockDrag(editor: Editor, index: number, start: PointerEvent, onEnd: () => void) {
  const { view } = editor
  const at = topLevelBlocks(editor.state.doc)[index]
  const dom = view.nodeDOM(at?.pos ?? -1)
  const root = view.dom.closest<HTMLElement>("[data-mention-root]")
  if (!at || !(dom instanceof HTMLElement) || !root) return onEnd()

  const block = dom
  const rect = block.getBoundingClientRect()
  const grab = { x: start.clientX - rect.left, y: start.clientY - rect.top }
  const scroller = scrollParent(block)
  const was = { opacity: block.style.opacity, transition: block.style.transition }
  const pointer = { x: start.clientX, y: start.clientY }
  let live: { preview: HTMLElement; line: HTMLElement } | null = null
  let gap = index
  let frame = 0

  debugBlockDrag("pointerdown", { index, x: start.clientX, y: start.clientY })

  function begin() {
    debugBlockDrag("drag start", { index })
    live = { preview: makePreview(block, view.dom.className, rect.width), line: makeDropLine(root!) }
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
    onEnd()
    if (!commit) return

    const tr = live ? moveBlock(editor.state, index, gap) : editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, at.pos))
    debugBlockDrag(live ? "move" : "select", tr ? "dispatched" : "nothing to move")
    if (tr) view.dispatch(tr)
    view.focus()
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
