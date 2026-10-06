import type { MultiPolygon } from "polygon-clipping"

// How far every point of the sea is from the nearest land, worked out on a grid
// of cells this many canvas pixels wide. A distance changes smoothly, so a
// coarse grid is plenty, and the water is shaded from it at any resolution.
export const CELL = 3

// How fast the "open" measure below fades with distance. Lower reaches further
// into channels from the open sea.
const OPEN_SLOPE = 0.6
const NO_LAND = 1e20

export type Field = {
  cols: number
  rows: number
  // Distance to the nearest land, in canvas pixels; 0 on land.
  land: Float32Array
  // How wide the water is around each point: the largest distance to land found
  // nearby, discounted by how far away that is. Small in a narrow channel or
  // bay, large wherever the sea opens out.
  open: Float32Array
}

// Squared distance transform of one row or column (Felzenszwalb and
// Huttenlocher): the lower envelope of parabolas, one rooted at each cell.
function transform(f: Float32Array, out: Float32Array, v: Int32Array, z: Float32Array) {
  const n = f.length
  let k = 0
  v[0] = 0
  z[0] = -Infinity
  z[1] = Infinity
  const cross = (q: number, p: number) => (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p)
  for (let q = 1; q < n; q++) {
    let s = cross(q, v[k])
    while (s <= z[k]) s = cross(q, v[--k])
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = Infinity
  }
  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    out[q] = (q - v[k]) ** 2 + f[v[k]]
  }
}

function distances(mask: Uint8ClampedArray, cols: number, rows: number) {
  const grid = new Float32Array(cols * rows)
  for (let i = 0; i < grid.length; i++) grid[i] = mask[i * 4] > 127 ? 0 : NO_LAND
  const size = Math.max(cols, rows)
  const v = new Int32Array(size)
  const z = new Float32Array(size + 1)
  const line = new Float32Array(rows)
  const result = new Float32Array(rows)
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) line[y] = grid[y * cols + x]
    transform(line, result, v, z)
    for (let y = 0; y < rows; y++) grid[y * cols + x] = result[y]
  }
  const across = new Float32Array(cols)
  const done = new Float32Array(cols)
  for (let y = 0; y < rows; y++) {
    across.set(grid.subarray(y * cols, (y + 1) * cols))
    transform(across, done, v, z)
    for (let x = 0; x < cols; x++) {
      // Half a cell back: the edge lies between the last land cell and the sea.
      grid[y * cols + x] = Math.max(Math.sqrt(done[x]) - 0.5, 0) * CELL
    }
  }
  return grid
}

// Softens the creases where the distances to two coasts meet, so rings that
// merge between close islands turn in a curve rather than a point.
function soften(grid: Float32Array, cols: number, rows: number) {
  const pass = (stride: number, count: number, step: number, length: number) => {
    const copy = Float32Array.from(grid)
    for (let line = 0; line < count; line++) {
      for (let n = 1; n < length - 1; n++) {
        const i = line * stride + n * step
        grid[i] = (copy[i - step] + 2 * copy[i] + copy[i + step]) / 4
      }
    }
  }
  for (let round = 0; round < 3; round++) {
    pass(cols, rows, 1, cols)
    pass(1, cols, cols, rows)
  }
}

// Two sweeps across the grid, each point taking the best of its neighbours less
// what the step costs.
function opening(land: Float32Array, cols: number, rows: number) {
  const open = Float32Array.from(land)
  const side = OPEN_SLOPE * CELL
  const corner = side * Math.SQRT2
  const settle = (x: number, y: number, dx: number, dy: number) => {
    const i = y * cols + x
    const best = (nx: number, ny: number, cost: number) =>
      nx >= 0 && nx < cols && ny >= 0 && ny < rows ? open[ny * cols + nx] - cost : 0
    open[i] = Math.max(
      open[i],
      best(x - dx, y, side),
      best(x, y - dy, side),
      best(x - dx, y - dy, corner),
      best(x + dx, y - dy, corner)
    )
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) settle(x, y, 1, 1)
  for (let y = rows - 1; y >= 0; y--) for (let x = cols - 1; x >= 0; x--) settle(x, y, -1, -1)
  return open
}

export function buildField(
  land: MultiPolygon,
  { width, height }: { width: number; height: number }
): Field {
  const cols = Math.ceil(width / CELL)
  const rows = Math.ceil(height / CELL)
  const canvas = document.createElement("canvas")
  canvas.width = cols
  canvas.height = rows
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.scale(1 / CELL, 1 / CELL)
  context.beginPath()
  for (const polygon of land) {
    for (const ring of polygon) {
      ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
      context.closePath()
    }
  }
  context.fillStyle = "#fff"
  context.fill("evenodd")
  const mask = context.getImageData(0, 0, cols, rows).data
  const distance = distances(mask, cols, rows)
  const open = opening(distance, cols, rows)
  soften(distance, cols, rows)
  return { cols, rows, land: distance, open }
}
