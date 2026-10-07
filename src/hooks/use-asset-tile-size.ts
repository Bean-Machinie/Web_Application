import { useState } from "react"

const STORAGE_KEY = "map-builder:asset-tile-size"

// The least width a tile of the library may have, in pixels: with the panel as
// wide as it is, from four tiles to a row to two.
export const TILE_SIZE = { min: 56, max: 120, start: 64 }

const clamp = (size: number) => Math.min(Math.max(size, TILE_SIZE.min), TILE_SIZE.max)

// How big the library's tiles are, remembered in this browser.
export function useAssetTileSize() {
  const [size, setSize] = useState(() => {
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY))
      return stored > 0 ? clamp(stored) : TILE_SIZE.start
    } catch {
      return TILE_SIZE.start
    }
  })

  function change(next: number) {
    setSize(next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [size, change] as const
}
