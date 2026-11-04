import { createDropMarker, hitAt } from "./journal-drop-target"
import type { DropHit, DropTarget } from "./journal-drop-target"

const START_PX = 5
// Where the tag sits against the pointer, so the pointer is on the tab part of it.
const GRAB = { x: 20, y: 18 }
const TAG = { width: 160, height: 36 }

let ending: (() => void) | null = null

// Carries a page by its name out of the tree. What follows the pointer is drawn by
// `mountTag` into a box it is given, the same tab as one carried between panes; where
// it would land is marked the same way too. Letting go on a mark calls onDrop;
// anywhere else, or Esc, drops nothing. A press that never moves is left to be a click.
export function startPageDrag(
  start: PointerEvent,
  panes: number,
  mountTag: (host: HTMLElement) => () => void,
  onDrop: (target: DropTarget) => void
) {
  ending?.()
  let live: { host: HTMLElement; unmount: () => void; marker: ReturnType<typeof createDropMarker> } | null = null
  let hit: DropHit | null = null

  function begin() {
    const host = document.createElement("div")
    host.style.cssText = `position:fixed;z-index:70;pointer-events:none;width:${TAG.width}px;height:${TAG.height}px`
    document.body.append(host)
    live = { host, unmount: mountTag(host), marker: createDropMarker() }
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"
  }

  function move(event: PointerEvent) {
    if (!live) {
      if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) <= START_PX) return
      begin()
    }
    const { host, marker } = live!
    host.style.left = `${event.clientX - GRAB.x}px`
    host.style.top = `${event.clientY - GRAB.y}px`
    hit = hitAt(event.clientX, event.clientY, panes)
    marker.show(hit)
  }

  function finish(commit: boolean) {
    window.removeEventListener("pointermove", move)
    window.removeEventListener("pointerup", up)
    window.removeEventListener("pointercancel", cancel)
    window.removeEventListener("keydown", key, true)
    window.removeEventListener("blur", cancel)
    if (ending === cancel) ending = null
    const dragged = live !== null
    live?.unmount()
    live?.host.remove()
    live?.marker.remove()
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
    if (!dragged) return

    // The release would otherwise count as a click on the page's name, which for a
    // link also means going to its address: the page would reload.
    const swallow = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("click", swallow, { capture: true, once: true })
    window.setTimeout(() => window.removeEventListener("click", swallow, true), 50)
    if (commit && hit) onDrop(hit.target)
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
