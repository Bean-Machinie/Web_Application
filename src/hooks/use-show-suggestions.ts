import { useState } from "react"

const STORAGE_KEY = "quick-build:suggestions"

// Whether the sentence shows the word it suggests, remembered in this browser. On unless turned off.
export function useShowSuggestions() {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "off"
    } catch {
      return true
    }
  })

  function change(next: boolean) {
    setShow(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off")
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [show, change] as const
}
