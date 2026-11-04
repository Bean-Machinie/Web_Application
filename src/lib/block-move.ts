import { Selection, TextSelection } from "@tiptap/pm/state"
import type { EditorState, Transaction } from "@tiptap/pm/state"
import type { Node as ProseNode } from "@tiptap/pm/model"

export type Block = { index: number; pos: number; size: number }

export function topLevelBlocks(doc: ProseNode) {
  const blocks: Block[] = []
  doc.forEach((node, pos, index) => blocks.push({ index, pos, size: node.nodeSize }))
  return blocks
}

// The block a position falls in or after: where a hovered block's position
// points, even if the document has changed since.
export function blockIndexAt(doc: ProseNode, pos: number) {
  const blocks = topLevelBlocks(doc)
  return Math.max(0, blocks.filter((block) => block.pos <= pos).length - 1)
}

// Moves a top-level block into a gap, in one transaction. Gap k is the one before
// block k; the last gap is after the final block. Null when it would not move:
// the gaps either side of the block are where it already is.
export function moveBlock(state: EditorState, index: number, gap: number): Transaction | null {
  const blocks = topLevelBlocks(state.doc)
  const block = blocks[index]
  if (!block || gap < 0 || gap > blocks.length || gap === index || gap === index + 1) return null

  const end = block.pos + block.size
  const at = gap === blocks.length ? state.doc.content.size : blocks[gap].pos
  const node = state.doc.child(index)
  const tr = state.tr

  // Whichever side is further along goes first, so the other position still holds.
  let start: number
  if (at > block.pos) {
    tr.insert(at, node).delete(block.pos, end)
    start = at - block.size
  } else {
    tr.delete(block.pos, end).insert(at, node)
    start = at
  }

  // The cursor stays where it was in the text.
  const { selection } = state
  const inside = (pos: number) => pos >= block.pos && pos <= end
  tr.setSelection(
    selection instanceof TextSelection && inside(selection.anchor) && inside(selection.head)
      ? TextSelection.create(tr.doc, start + selection.anchor - block.pos, start + selection.head - block.pos)
      : Selection.near(tr.doc.resolve(start + 1))
  )
  return tr
}
