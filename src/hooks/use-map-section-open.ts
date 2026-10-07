import { useState } from "react"

const STORAGE_KEY = "map-builder:map-section-open"

// Whether the Map section of the right panel is open: shut until opened, then
// remembered in this browser.
export function useMapSectionOpen() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1"
    } catch {
      return false
    }
  })

  function change(next: boolean) {
    setOpen(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [open, change] as const
}
