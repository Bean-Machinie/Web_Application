// A map picture read as a coarse grid of land and water, for a route to find its way over the land.
export const GRID = 64

export type LandGrid = {
  // 1 for land, 0 for water, row by row.
  land: Uint8Array
  // How many cells each cell is from water or the picture's edge.
  shore: Float32Array
}

// Blue well above red and above green reads as water; so does a see-through pixel.
const isWater = (r: number, g: number, b: number, a: number) => a < 128 || (b > r + 20 && b > g)

// Steps out from every water cell at once, so each land cell learns how far the nearest water is; the
// picture's edge counts as water too, so routes keep off it.
function distanceToShore(land: Uint8Array) {
  const shore = new Float32Array(land.length)
  const queue = new Int32Array(land.length)
  let tail = 0
  for (let i = 0; i < land.length; i++) {
    const [x, y] = [i % GRID, Math.floor(i / GRID)]
    shore[i] = land[i] ? Math.min(x + 1, y + 1, GRID - x, GRID - y) : 0
    if (!land[i]) queue[tail++] = i
  }
  for (let head = 0; head < tail; head++) {
    const i = queue[head]
    const [x, y] = [i % GRID, Math.floor(i / GRID)]
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue
      const n = ny * GRID + nx
      if (shore[n] > shore[i] + 1) {
        shore[n] = shore[i] + 1
        queue[tail++] = n
      }
    }
  }
  return shore
}

// The picture squeezed to the grid; null when its pixels cannot be read, as for another site's image
// that does not allow it.
export function landGrid(image: HTMLImageElement): LandGrid | null {
  const canvas = document.createElement("canvas")
  canvas.width = GRID
  canvas.height = GRID
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, GRID, GRID)
  let pixels: Uint8ClampedArray
  try {
    pixels = ctx.getImageData(0, 0, GRID, GRID).data
  } catch {
    return null
  }
  const land = new Uint8Array(GRID * GRID)
  for (let i = 0; i < land.length; i++) land[i] = isWater(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2], pixels[i * 4 + 3]) ? 0 : 1
  return { land, shore: distanceToShore(land) }
}
