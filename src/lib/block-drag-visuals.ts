const EDGE_PX = 60
const MAX_SCROLL_PX = 18

// The block itself, half see-through, kept outside the editor so nothing in it
// moves. It wears the editor's classes so the text looks the same there.
export function makePreview(block: HTMLElement, editorClass: string, width: number) {
  const holder = document.createElement("div")
  holder.className = editorClass
  holder.setAttribute("aria-hidden", "true")
  Object.assign(holder.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${width}px`,
    minHeight: "0",
    padding: "0",
    opacity: "0.5",
    pointerEvents: "none",
    zIndex: "70",
  })
  holder.appendChild(block.cloneNode(true))
  document.body.appendChild(holder)
  return holder
}

// The line where the block would land: the accent colour, a dot at its left end.
export function makeDropLine(root: HTMLElement) {
  const line = document.createElement("div")
  line.className =
    "pointer-events-none absolute z-50 h-0.5 rounded-full bg-primary before:absolute before:top-1/2 before:-left-1 before:size-2 before:-translate-y-1/2 before:rounded-full before:bg-primary before:content-['']"
  root.appendChild(line)
  return line
}

// The nearest ancestor that scrolls; null when it is the page itself.
export function scrollParent(element: HTMLElement) {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const scrolls = /(auto|scroll)/.test(getComputedStyle(parent).overflowY)
    if (scrolls && parent.scrollHeight > parent.clientHeight) return parent
  }
  return null
}

// Scrolls a little when the pointer is within EDGE_PX of the top or bottom,
// faster the closer it gets.
export function autoScroll(scroller: HTMLElement | null, pointerY: number) {
  const top = scroller ? scroller.getBoundingClientRect().top : 0
  const bottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight
  const near = (distance: number) => Math.min(1, Math.max(0, 1 - distance / EDGE_PX))
  const speed = (near(bottom - pointerY) - near(pointerY - top)) * MAX_SCROLL_PX

  if (scroller) scroller.scrollTop += speed
  else window.scrollBy(0, speed)
}
