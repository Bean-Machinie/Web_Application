import { MAX_PANES } from "./journal-workspace"

// Where something carried over the workspace (a tab, or a page out of the tree)
// would land: among the tabs of a pane (at an index), on a pane's panel (as its last
// tab), or on the right edge of the only pane (a second pane beside it).
export type DropTarget =
  | { kind: "tab"; pane: number; index: number }
  | { kind: "pane"; pane: number }
  | { kind: "edge"; pane: number }

type Box = { left: number; top: number; width: number; height: number }
export type DropHit = { target: DropTarget; box: Box; line: boolean }

const EDGE_PX = 96

const MARK_AREA =
  "border-primary/50 bg-primary/10 fixed z-[70] rounded-md border-2 pointer-events-none transition-[left,top,width,height] duration-100"
const MARK_LINE =
  "bg-primary fixed z-[70] rounded-full pointer-events-none transition-[left,top,height] duration-100"

// What is under the pointer, by where the panes are drawn: their tabs, their panels
// and, while there is one pane, its right edge, which makes a second.
export function hitAt(x: number, y: number, panes: number): DropHit | null {
  for (const element of document.querySelectorAll<HTMLElement>("[data-journal-pane]")) {
    const pane = Number(element.dataset.journalPane)
    const area = element.getBoundingClientRect()
    if (x < area.left || x > area.right || y < area.top || y > area.bottom) continue

    if (panes < MAX_PANES && x > area.right - EDGE_PX) {
      return {
        target: { kind: "edge", pane },
        box: { left: area.right - EDGE_PX, top: area.top, width: EDGE_PX, height: area.height },
        line: false,
      }
    }

    const strip = element.querySelector<HTMLElement>("[data-journal-strip]")?.getBoundingClientRect()
    if (strip && y <= strip.bottom) {
      const tabs = [...element.querySelectorAll<HTMLElement>("[data-journal-tab]")].map((tab) => tab.getBoundingClientRect())
      const index = tabs.filter((tab) => x > tab.left + tab.width / 2).length
      const at = index < tabs.length ? tabs[index].left : (tabs[tabs.length - 1]?.right ?? strip.left)
      return {
        target: { kind: "tab", pane, index },
        box: { left: at - 1, top: strip.top, width: 2, height: strip.height },
        line: true,
      }
    }
    return {
      target: { kind: "pane", pane },
      box: { left: area.left, top: area.top, width: area.width, height: area.height },
      line: false,
    }
  }
  return null
}

// The mark that shows where it would land: a line between tabs, a pane lit, or the
// edge of the only pane lit. One for the whole drag; remove it when the drag ends.
export function createDropMarker() {
  const mark = document.createElement("div")
  mark.style.display = "none"
  document.body.append(mark)

  return {
    show(hit: DropHit | null) {
      mark.style.display = hit ? "block" : "none"
      if (!hit) return
      mark.className = hit.line ? MARK_LINE : MARK_AREA
      mark.style.left = `${hit.box.left}px`
      mark.style.top = `${hit.box.top}px`
      mark.style.width = `${hit.box.width}px`
      mark.style.height = `${hit.box.height}px`
    },
    remove: () => mark.remove(),
  }
}
