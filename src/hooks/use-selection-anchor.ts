import { useLayoutEffect, useState } from "react"
import type { RefObject } from "react"
import type { Editor } from "@tiptap/react"

const GAP = 8
const EDGE = 8
// The bar starts a little left of where the selection ends, as Word's does.
const LEAD = 24

export type Point = { x: number; y: number }
type Place = { left: number; top: number; visible: boolean }
// Where the bar hangs from, measured from the editor's own corner so that scrolling,
// which moves the editor, moves it too without asking the text again.
type Hang = { x: number; top: number; bottom: number }

// Where a floating bar sits so that it rests above the end of the editor's selection,
// or above `point` when given (where a right-click menu opens, so the two line up), and
// below it when there is no room above. It is placed when it appears, and again when the
// selection is changed by hand. Formatting changes the text under it, and the bar then
// stays where it is rather than following the new layout (a list moves the text over).
// Null until measured, so the bar is never drawn at a stale place.
export function useSelectionAnchor(editor: Editor, active: boolean, bar: RefObject<HTMLElement | null>, point: Point | null) {
  const [place, setPlace] = useState<Place | null>(null)

  useLayoutEffect(() => {
    if (!active) return
    const dom = editor.view.dom
    let hang: Hang | null = null
    let frozen = false

    const read = () => {
      const origin = dom.getBoundingClientRect()
      const end = point
        ? { left: point.x, top: point.y, bottom: point.y }
        : editor.view.coordsAtPos(editor.state.selection.to)
      hang = { x: end.left - origin.left, top: end.top - origin.top, bottom: end.bottom - origin.top }
    }

    const put = () => {
      const node = bar.current
      if (!node || !hang) return
      const origin = dom.getBoundingClientRect()
      const top = origin.top + hang.top
      const bottom = origin.top + hang.bottom
      const above = top - node.offsetHeight - GAP
      const left = origin.left + hang.x - (point ? 0 : LEAD)
      setPlace({
        left: Math.min(Math.max(left, EDGE), window.innerWidth - node.offsetWidth - EDGE),
        top: above >= EDGE ? above : bottom + GAP,
        visible: bottom > 0 && top < window.innerHeight,
      })
    }

    const onSelection = () => {
      if (!frozen) read()
      put()
    }
    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (transaction.docChanged) frozen = true
    }
    const unfreeze = () => {
      frozen = false
    }

    read()
    put()
    editor.on("selectionUpdate", onSelection)
    editor.on("update", put)
    editor.on("transaction", onTransaction)
    dom.addEventListener("keydown", unfreeze)
    dom.addEventListener("mousedown", unfreeze)
    window.addEventListener("scroll", put, true)
    window.addEventListener("resize", put)
    return () => {
      editor.off("selectionUpdate", onSelection)
      editor.off("update", put)
      editor.off("transaction", onTransaction)
      dom.removeEventListener("keydown", unfreeze)
      dom.removeEventListener("mousedown", unfreeze)
      window.removeEventListener("scroll", put, true)
      window.removeEventListener("resize", put)
      setPlace(null)
    }
  }, [editor, active, bar, point])

  return place
}
