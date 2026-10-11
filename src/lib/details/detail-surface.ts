import { TILE } from "../biomes/biomes"
import type { Cells } from "../biomes/brush"
import { CHANNELS, gridSize } from "../biomes/paint-tiles"
import type { Paint } from "../biomes/paint-tiles"
import type { TileAt } from "../biomes/surface"
import { detailTile, grainPixels } from "./detail-texture"
import { DETAIL_CELL, DETAILS } from "./details"

// A change shows a little past its own cells, because the picture is blended
// smoothly between cells; and the blending reads some more cells round that.
const REACH = 1
const MARGIN = 2

// The details' colour, drawn over the whole canvas, transparent where there are
// none. Each material's weights are laid as an image, one pixel to a cell, that is
// stretched smoothly to the picture's size, so that a path is smooth at any zoom.
// Only the part that changed is drawn again, and nothing is kept for each material
// but the small tile of its grain.
export function createDetailSurface(canvas: { width: number; height: number }, scale: number) {
  const { cols, rows } = gridSize(canvas, DETAIL_CELL)
  const picture = document.createElement("canvas")
  picture.width = Math.round(canvas.width * scale)
  picture.height = Math.round(canvas.height * scale)
  const context = picture.getContext("2d")!

  const side = grainPixels(scale)
  const scratch = document.createElement("canvas")
  const scratchContext = scratch.getContext("2d")!
  const plane = document.createElement("canvas")
  const planeContext = plane.getContext("2d")!
  // The paint the picture was last drawn whole from, so it is not drawn again.
  const state = { drawn: null as Paint | null, touched: false }

  // Pixels of the picture to a cell.
  const k = DETAIL_CELL * scale
  const toPicture = (cell: number) => Math.round(cell * k)

  function draw(changed: Cells, tileAt: TileAt) {
    const x0 = Math.max(changed.x0 - REACH, 0)
    const y0 = Math.max(changed.y0 - REACH, 0)
    const x1 = Math.min(changed.x1 + REACH, cols - 1)
    const y1 = Math.min(changed.y1 + REACH, rows - 1)
    const ex0 = Math.max(x0 - MARGIN, 0)
    const ey0 = Math.max(y0 - MARGIN, 0)
    const ex1 = Math.min(x1 + MARGIN, cols - 1)
    const ey1 = Math.min(y1 + MARGIN, rows - 1)
    const width = ex1 - ex0 + 1
    const height = ey1 - ey0 + 1
    const dx = toPicture(x0)
    const dy = toPicture(y0)
    const dw = toPicture(x1 + 1) - dx
    const dh = toPicture(y1 + 1) - dy
    // The read area is cut on whole pixels inside its cells, and each pixel is read
    // where it falls on the cells, so that a box is drawn exactly as the whole would be.
    const edx = Math.min(Math.ceil(ex0 * k), dx)
    const edy = Math.min(Math.ceil(ey0 * k), dy)
    const edw = Math.max(Math.floor((ex1 + 1) * k), dx + dw) - edx
    const edh = Math.max(Math.floor((ey1 + 1) * k), dy + dh) - edy

    const weights = DETAILS.map(() => new ImageData(width, height))
    const present = DETAILS.map(() => false)
    let tile: ReturnType<TileAt>
    let tileX = -1
    let tileY = -1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cx = ex0 + x
        const cy = ey0 + y
        const tx = Math.floor(cx / TILE)
        const ty = Math.floor(cy / TILE)
        if (tx !== tileX || ty !== tileY) {
          tileX = tx
          tileY = ty
          tile = tileAt(`${tx},${ty}`)
        }
        if (!tile) continue
        const cell = ((cy % TILE) * TILE + (cx % TILE)) * CHANNELS
        for (let c = 0; c < CHANNELS; c++) {
          const weight = tile[cell + c]
          if (weight <= 0) continue
          present[c] = true
          const at = (y * width + x) * 4
          weights[c].data[at] = weights[c].data[at + 1] = weights[c].data[at + 2] = 255
          weights[c].data[at + 3] = Math.round(weight)
        }
      }
    }

    if (present.some(Boolean)) state.touched = true
    context.clearRect(dx, dy, dw, dh)
    plane.width = width
    plane.height = height
    for (let c = 0; c < CHANNELS; c++) {
      if (!present[c]) continue
      planeContext.putImageData(weights[c], 0, 0)
      // The grain is laid on first, then cut down to the weights.
      scratch.width = edw
      scratch.height = edh
      scratchContext.translate(-edx, -edy)
      scratchContext.fillStyle = scratchContext.createPattern(detailTile(DETAILS[c], side), "repeat")!
      scratchContext.fillRect(edx, edy, edw, edh)
      scratchContext.setTransform(1, 0, 0, 1, 0, 0)
      scratchContext.globalCompositeOperation = "destination-in"
      scratchContext.imageSmoothingEnabled = true
      scratchContext.drawImage(plane, edx / k - ex0, edy / k - ey0, edw / k, edh / k, 0, 0, edw, edh)
      context.drawImage(scratch, dx - edx, dy - edy, dw, dh, dx, dy, dw, dh)
    }
  }

  function drawAll(paint: Paint) {
    context.clearRect(0, 0, picture.width, picture.height)
    const at: TileAt = (key) => paint.get(key)
    for (const key of paint.keys()) {
      const [tx, ty] = key.split(",").map(Number)
      draw({ x0: tx * TILE, y0: ty * TILE, x1: (tx + 1) * TILE - 1, y1: (ty + 1) * TILE - 1 }, at)
    }
    state.drawn = paint
    state.touched = paint.size > 0
  }

  // The picture already shows this paint, as a stroke leaves it.
  function adopt(paint: Paint) {
    state.drawn = paint
    state.touched = state.touched || paint.size > 0
  }

  return { picture, draw, drawAll, adopt, state }
}

export type DetailSurface = ReturnType<typeof createDetailSurface>
