import { Extension } from "@tiptap/react"
import { moveBlock } from "@/lib/block-move"

// Ctrl+Shift+Up or Down moves the block the cursor is in past its neighbour.
export const BlockMoveKeys = Extension.create({
  name: "blockMoveKeys",
  addKeyboardShortcuts() {
    const move = (step: -1 | 1) => () => {
      const { state, view } = this.editor
      const index = state.selection.$from.index(0)
      const tr = moveBlock(state, index, step < 0 ? index - 1 : index + 2)
      if (tr) view.dispatch(tr.scrollIntoView())
      // Taken either way: at the ends the keys must not fall through and select text.
      return true
    }
    return { "Mod-Shift-ArrowUp": move(-1), "Mod-Shift-ArrowDown": move(1) }
  },
})
