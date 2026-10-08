// Long work is done in pieces, so that the page stays smooth while it goes on:
// after a short time of work, "tick" hands the thread back to the browser, which
// can then draw and answer the pointer before the work goes on.
const BUDGET_MS = 8

const nextTask = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => resolve()
    channel.port2.postMessage(null)
  })

// Returns true if it gave the thread back.
export function timeSlicer() {
  let since = performance.now()
  return async () => {
    if (performance.now() - since < BUDGET_MS) return false
    await nextTask()
    since = performance.now()
    return true
  }
}
