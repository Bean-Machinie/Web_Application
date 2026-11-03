import { storage } from "@/lib/browser-storage"
import { findDiceStyle } from "@/lib/dice-styles"
import type { DiceStyle } from "@/lib/dice-styles"

const STORAGE_KEY = "dice-style"

// Kept outside React because the 3D engine, the roll boxes and the pickers all follow it.
let current = findDiceStyle(storage.getItem(STORAGE_KEY))
const listeners = new Set<() => void>()

export const getDiceStyle = () => current

export function setDiceStyle(style: DiceStyle) {
  if (style.id === current.id) return
  current = style
  storage.setItem(STORAGE_KEY, style.id)
  listeners.forEach((listener) => listener())
}

export function subscribeDiceStyle(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
