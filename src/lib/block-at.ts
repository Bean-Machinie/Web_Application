import type { Editor } from "@tiptap/react"
import { topLevelBlocks } from "./block-move"

export type BlockHit = { index: number; dom: HTMLElement; top: number; height: number }

function blockBoxes(editor: Editor) {
  return topLevelBlocks(editor.state.doc).flatMap((block) => {
    const dom = editor.view.nodeDOM(block.pos)
    return dom instanceof HTMLElement ? [{ index: block.index, dom, rect: dom.getBoundingClientRect() }] : []
  })
}

// Where each gap between the top-level blocks is on screen: the top of the first
// block, the middle of the space between two, the bottom of the last.
export function gapLines(editor: Editor) {
  const rects = blockBoxes(editor).map((box) => box.rect)
  if (rects.length === 0) return []
  return [
    rects[0].top,
    ...rects.slice(1).map((rect, i) => (rects[i].bottom + rect.top) / 2),
    rects[rects.length - 1].bottom,
  ]
}

// The block a height on screen belongs to, and nothing else decides it: each
// block owns everything from the middle of the space above it to the middle of
// the space below, so a thin block like a divider is as easy to reach as a
// paragraph, and above the first or below the last is the first or the last.
export function blockAtY(editor: Editor, y: number): BlockHit | null {
  const boxes = blockBoxes(editor)
  if (boxes.length === 0) return null
  const lines = gapLines(editor)
  const index = lines.slice(1, -1).filter((line) => line <= y).length
  const { dom, rect } = boxes[index]
  return { index, dom, top: rect.top, height: rect.height }
}
