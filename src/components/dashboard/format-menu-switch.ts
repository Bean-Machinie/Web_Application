// What the lists of the format bar are given: which one is open, and how to change that.
export type MenuControl = {
  id: string
  openId: string | null
  // `from` is the list asking, so that a late word from one already left is ignored.
  choose: (next: string | null, from: string) => void
}

// An open list blocks the pointer from everything beneath it, so a press on another
// button of the format bar never reaches that button. The button under the press is
// found by where it landed.
function barButtonUnder(event: { detail: { originalEvent: PointerEvent } }): HTMLElement | null {
  const { clientX, clientY } = event.detail.originalEvent
  for (const button of document.querySelectorAll<HTMLElement>("[data-format-bar] button")) {
    const box = button.getBoundingClientRect()
    if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) return button
  }
  return null
}

// A press outside an open list: the list closes, and what was pressed takes effect in the
// same step. Another list opens; a plain button, such as a list or bold, does its work.
export function leaveTo(event: { detail: { originalEvent: PointerEvent } }, control: MenuControl) {
  const button = barButtonUnder(event)
  const menu = button?.dataset.formatMenu ?? null
  control.choose(menu === control.id ? null : menu, control.id)
  if (button && !menu) button.click()
}
