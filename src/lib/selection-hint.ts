// The hint that says how to pick several entries is shown until the person has
// done it once, then no more: it would only be in the way. Kept in the browser
// so it stays away on later visits too.
const KEY = "entry-selection-learned"

function read() {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

let learned = read()
const listeners = new Set<() => void>()

export const hintLearned = () => learned

export function subscribeHint(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function markSelectionLearned() {
  if (learned) return
  learned = true
  try {
    localStorage.setItem(KEY, "1")
  } catch {
    // The hint then comes back next visit; nothing is lost.
  }
  listeners.forEach((listener) => listener())
}

// The key that picks one more entry: Cmd on a Mac, Ctrl elsewhere.
export const MODIFIER_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘" : "Ctrl"
