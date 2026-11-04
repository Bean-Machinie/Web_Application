import { MAX_PANES } from "./journal-workspace"

// Where a page dragged out of the tree was dropped: among the tabs of a pane (at an
// index), on a pane's panel (as its last tab), or on a pane's right edge (a pane to
// its right, made if there is none).
export type PageDrop =
  | { kind: "tab"; pane: number; index: number }
  | { kind: "pane"; pane: number }
  | { kind: "edge"; pane: number }

type Box = { left: number; top: number; width: number; height: number }

const EDGE_PX = 96
const START_PX = 5

const MARK_AREA = "border-primary/50 bg-primary/10 fixed z-[70] rounded-md border-2 pointer-events-none transition-[left,top,width,height] duration-100"
const MARK_LINE = "bg-primary fixed z-[70] rounded-full pointer-events-none transition-[left,top,height] duration-100"
const CHIP =
  "bg-background text-foreground fixed z-[70] max-w-52 truncate rounded-md border px-2.5 py-1 text-xs shadow-lg pointer-events-none"

// What is under the pointer, by where the panes are drawn: their tabs, their panels,
// and their right edges, which only take a page if a pane can open there.
function hitAt(x: number, y: number, panes: number): { drop: PageDrop; box: Box; line: boolean } | null {
  for (const element of document.querySelectorAll<HTMLElement>("[data-journal-pane]")) {
    const pane = Number(element.dataset.journalPane)
    const area = element.getBoundingClientRect()
    if (x < area.left || x > area.right || y < area.top || y > area.bottom) continue

    if ((pane < panes - 1 || panes < MAX_PANES) && x > area.right - EDGE_PX) {
      return { drop: { kind: "edge", pane }, box: { left: area.right - EDGE_PX, top: area.top, width: EDGE_PX, height: area.height }, line: false }
    }

    const strip = element.querySelector<HTMLElement>("[data-journal-strip]")?.getBoundingClientRect()
    if (strip && y <= strip.bottom) {
      const tabs = [...element.querySelectorAll<HTMLElement>("[data-journal-tab]")].map((tab) => tab.getBoundingClientRect())
      const index = tabs.filter((tab) => x > tab.left + tab.width / 2).length
      const at = index < tabs.length ? tabs[index].left : (tabs[tabs.length - 1]?.right ?? strip.left)
      return { drop: { kind: "tab", pane, index }, box: { left: at - 1, top: strip.top, width: 2, height: strip.height }, line: true }
    }
    return { drop: { kind: "pane", pane }, box: { left: area.left, top: area.top, width: area.width, height: area.height }, line: false }
  }
  return null
}

function place(element: HTMLElement, box: Box) {
  element.style.left = `${box.left}px`
  element.style.top = `${box.top}px`
  element.style.width = `${box.width}px`
  element.style.height = `${box.height}px`
}

let ending: (() => void) | null = null

// Carries a page by its name out of the tree: a tag follows the pointer, and where
// it would land is marked: a line between tabs, or a pane lit, or a pane's right
// edge. Letting go there calls onDrop; anywhere else, or Esc, drops nothing. A press
// that never moves is left to be a click.
export function startPageDrag(
  title: string,
  start: PointerEvent,
  panes: number,
  onDrop: (drop: PageDrop) => void
) {
  ending?.()
  let live: { chip: HTMLElement; mark: HTMLElement } | null = null
  let hit: ReturnType<typeof hitAt> = null

  function begin() {
    const chip = document.createElement("div")
    chip.className = CHIP
    chip.textContent = title
    const mark = document.createElement("div")
    mark.style.display = "none"
    document.body.append(mark, chip)
    live = { chip, mark }
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"
  }

  function move(event: PointerEvent) {
    if (!live) {
      if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) <= START_PX) return
      begin()
    }
    const { chip, mark } = live!
    chip.style.left = `${event.clientX + 12}px`
    chip.style.top = `${event.clientY + 12}px`

    hit = hitAt(event.clientX, event.clientY, panes)
    mark.style.display = hit ? "block" : "none"
    if (hit) {
      mark.className = hit.line ? MARK_LINE : MARK_AREA
      place(mark, hit.box)
    }
  }

  function finish(commit: boolean) {
    window.removeEventListener("pointermove", move)
    window.removeEventListener("pointerup", up)
    window.removeEventListener("pointercancel", cancel)
    window.removeEventListener("keydown", key, true)
    window.removeEventListener("blur", cancel)
    if (ending === cancel) ending = null
    const dragged = live !== null
    live?.chip.remove()
    live?.mark.remove()
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
    if (!dragged) return

    // The release would otherwise count as a click on the page's name.
    const swallow = (event: Event) => event.stopPropagation()
    window.addEventListener("click", swallow, { capture: true, once: true })
    window.setTimeout(() => window.removeEventListener("click", swallow, true), 50)
    if (commit && hit) onDrop(hit.drop)
  }

  const up = () => finish(true)
  const cancel = () => finish(false)
  function key(event: KeyboardEvent) {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    finish(false)
  }

  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", up)
  window.addEventListener("pointercancel", cancel)
  window.addEventListener("keydown", key, true)
  window.addEventListener("blur", cancel)
  ending = cancel
}
