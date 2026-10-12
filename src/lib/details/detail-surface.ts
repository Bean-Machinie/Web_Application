import type { MultiPolygon } from "polygon-clipping"
import { TILE } from "../biomes/biomes"
import type { Cells } from "../biomes/brush"
import { CHANNELS, gridSize } from "../biomes/paint-tiles"
import type { Paint } from "../biomes/paint-tiles"
import type { TileAt } from "../biomes/surface"
import { castShadow } from "./detail-shadow"
import { detailTile, grainPixels } from "./detail-texture"
import { DETAIL_CELL, DETAILS, RIVER } from "./details"
import { createRiverPainter } from "./river-render"

// A change shows a little past its own cells, because the picture is blended
// smoothly between cells; and the blending reads some more cells round that, and the
// river's shadow some more: wider than the blur of its shadow, or the shadow would show where
// the part drawn ends.
const REACH = 1
const MARGIN = 22

// The details, drawn over the whole canvas, transparent where there are none: in two pictures,
// since the river is drawn by rules of its own and not under the coast's ink with the
// rest: "picture" holds the path and the gravel, to be drawn on the land, and "river" the
// river, in the sea's ground with its banks, to be drawn over the coast (see river-render.ts).
// Each material's weights are laid as an image, one pixel to a cell, that is stretched smoothly
// to the picture's size, so that a path is smooth at any zoom. Only the part that changed is drawn
// again, and nothing is kept for each of the path and the gravel but its tile.
export function createDetailSurface(canvas: { width: number; height: number }, scale: number, sea: HTMLCanvasElement) {
  const { cols, rows } = gridSize(canvas, DETAIL_CELL)
  const make = () => {
    const picture = document.createElement("canvas")
    picture.width = Math.round(canvas.width * scale)
    picture.height = Math.round(canvas.height * scale)
    return picture
  }
  const picture = make()
  const context = picture.getContext("2d")!
  const river = make()
  const riverContext = river.getContext("2d")!
  const painter = createRiverPainter(scale, sea)

  const side = grainPixels(scale)
  const scratch = document.createElement("canvas")
  const scratchContext = scratch.getContext("2d")!
  const plane = document.createElement("canvas")
  const planeContext = plane.getContext("2d")!
  // The paint the pictures were last drawn whole from, so it is not drawn again.
  const state = { drawn: null as Paint | null, touched: false, riverTouched: false }

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
        for (let c = 0; c < DETAILS.length; c++) {
          const weight = tile[cell + c]
          if (weight <= 0) continue
          present[c] = true
          const at = (y * width + x) * 4
          weights[c].data[at] = weights[c].data[at + 1] = weights[c].data[at + 2] = 255
          weights[c].data[at + 3] = Math.round(weight)
        }
      }
    }

    context.clearRect(dx, dy, dw, dh)
    riverContext.clearRect(dx, dy, dw, dh)
    plane.width = width
    plane.height = height
    // The source of the smoothing, in cells of the plane: each pixel of the read area where it falls.
    const source = { x: edx / k - ex0, y: edy / k - ey0, width: edw / k, height: edh / k }
    for (let c = 0; c < DETAILS.length; c++) {
      if (!present[c]) continue
      planeContext.putImageData(weights[c], 0, 0)
      if (c === RIVER) {
        state.riverTouched = true
        painter.paint(
          riverContext,
          plane,
          source,
          { x: edx, y: edy, width: edw, height: edh },
          { x: dx, y: dy, width: dw, height: dh },
          picture
        )
        continue
      }
      state.touched = true
      // The grain is laid on first, then cut down to the weights.
      scratch.width = edw
      scratch.height = edh
      scratchContext.translate(-edx, -edy)
      scratchContext.fillStyle = scratchContext.createPattern(detailTile(DETAILS[c], side), "repeat")!
      scratchContext.fillRect(edx, edy, edw, edh)
      scratchContext.setTransform(1, 0, 0, 1, 0, 0)
      scratchContext.globalCompositeOperation = "destination-in"
      scratchContext.imageSmoothingEnabled = true
      scratchContext.drawImage(plane, source.x, source.y, source.width, source.height, 0, 0, edw, edh)
      // The shadow is cast from the whole read area and kept to the changed part, and under the ground.
      castShadow(context, scratch, { x: dx, y: dy, width: dw, height: dh }, { x: dx - edx, y: dy - edy }, scale)
      context.drawImage(scratch, dx - edx, dy - edy, dw, dh, dx, dy, dw, dh)
    }
  }

  function drawAll(paint: Paint) {
    context.clearRect(0, 0, picture.width, picture.height)
    riverContext.clearRect(0, 0, river.width, river.height)
    state.riverTouched = false
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

  // The land as it is shown, which the river is drawn against. True if it is not what it was,
  // when the river is to be drawn again.
  const setLand = (land: MultiPolygon) => painter.setLand(land)

  return { picture, river, draw, drawAll, adopt, setLand, state }
}

export type DetailSurface = ReturnType<typeof createDetailSurface>
