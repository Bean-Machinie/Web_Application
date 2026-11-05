import { useLayoutEffect, useState } from "react"
import type { RefObject } from "react"
import type { Editor } from "@tiptap/react"

const GAP = 8
const EDGE = 8
// The bar starts a little left of where the selection ends, as Word's does.
const LEAD = 24

type Place = { left: number; top: number; visible: boolean }

// Where a floating bar sits so that it rests above the end of the editor's selection,
// or below it when there is no room above. Follows the selection, the scroll and the
// window, and keeps the bar inside the screen.
export function useSelectionAnchor(editor: Editor, active: boolean, bar: RefObject<HTMLElement | null>) {
  const [place, setPlace] = useState<Place | null>(null)

  useLayoutEffect(() => {
    if (!active) return
    const measure = () => {
      const node = bar.current
      if (!node) return
      const end = editor.view.coordsAtPos(editor.state.selection.to)
      const width = node.offsetWidth
      const height = node.offsetHeight
      const above = end.top - height - GAP
      const left = Math.min(Math.max(end.left - LEAD, EDGE), window.innerWidth - width - EDGE)
      setPlace({
        left,
        top: above >= EDGE ? above : end.bottom + GAP,
        visible: end.bottom > 0 && end.top < window.innerHeight,
      })
    }
    measure()
    editor.on("selectionUpdate", measure)
    editor.on("update", measure)
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    return () => {
      editor.off("selectionUpdate", measure)
      editor.off("update", measure)
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
    }
  }, [editor, active, bar])

  return place
}
