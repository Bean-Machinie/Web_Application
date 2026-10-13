// What a click on an entry carries that matters to picking.
export type ClickModifiers = { shiftKey: boolean; ctrlKey?: boolean; metaKey?: boolean }

// The ids from one to the other, both included, in the order shown. Empty if
// either is not shown.
export function rangeBetween(ids: string[], from: string, to: string) {
  const a = ids.indexOf(from)
  const b = ids.indexOf(to)
  if (a < 0 || b < 0) return []
  return ids.slice(Math.min(a, b), Math.max(a, b) + 1)
}

// Whether a key press is meant for a text box, which keeps Ctrl+A and Escape.
export function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null
  if (!element?.tagName) return false
  return (
    element.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
  )
}

type Box = { left: number; top: number; right: number; bottom: number }

export const intersects = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

export const plural = (count: number) => `${count} ${count === 1 ? "entry" : "entries"}`
