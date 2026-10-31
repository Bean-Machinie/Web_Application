import { useStoredValue } from "./use-stored-value"

const STORAGE_KEY = "map-builder:asset-tile-size"

// The least width a tile of the library may have, in pixels: with the panel as
// wide as it is, from four tiles to a row to two.
export const TILE_SIZE = { min: 56, max: 120, start: 64 }

const clamp = (size: number) => Math.min(Math.max(size, TILE_SIZE.min), TILE_SIZE.max)

function read(text: string | null) {
  const stored = Number(text)
  return stored > 0 ? clamp(stored) : TILE_SIZE.start
}

// How big the library's tiles are, remembered in this browser.
export const useAssetTileSize = () => useStoredValue(STORAGE_KEY, read)
