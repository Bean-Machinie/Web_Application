// An open list blocks the pointer from everything beneath it, so a press on another
// button of the format bar never reaches that button. The id of the button under the
// press, found by where it landed, lets the bar open that one's list in the same step.
export function menuUnder(event: { detail: { originalEvent: PointerEvent } }): string | null {
  const { clientX, clientY } = event.detail.originalEvent
  for (const trigger of document.querySelectorAll<HTMLElement>("[data-format-menu]")) {
    const box = trigger.getBoundingClientRect()
    if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) {
      return trigger.dataset.formatMenu ?? null
    }
  }
  return null
}

// What the lists of the format bar are given: which one is open, and how to change that.
export type MenuControl = {
  id: string
  openId: string | null
  // `from` is the list asking, so that a late word from one already left is ignored.
  choose: (next: string | null, from: string) => void
}
