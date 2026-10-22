import { useState } from "react"

export type CardSize = "small" | "medium" | "large"

// The least width of a card in the grid; as many columns as fit.
export const CARD_MIN_WIDTH: Record<CardSize, number> = { small: 150, medium: 200, large: 280 }

const KEY = "world-card-size"

// Remembered in this browser.
export function useWorldCardSize() {
  const [size, setSize] = useState<CardSize>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored === "small" || stored === "large" ? stored : "medium"
    } catch {
      return "medium"
    }
  })

  function change(next: CardSize) {
    setSize(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [size, change] as const
}
