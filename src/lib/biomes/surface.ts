import type { SceneBackground } from "../map-scene"
import { BIOMES, PAINT_CELL, TILE } from "./biomes"
import type { Biome } from "./biomes"
import type { Cells } from "./brush"
import { CHANNELS, gridSize } from "./paint-tiles"
import type { Paint } from "./paint-tiles"
import { biomeTile } from "./texture"

// Where the weights of a tile are read from: the paint, or a stroke in progress.
export type TileAt = (key: string) => ArrayLike<number> | undefined

// Cells drawn beyond the ones that changed, because the picture is blended
// smoothly between cells and so a change reaches a little past its own cells.
const REACH = 2

// The biomes' colour, drawn over the whole canvas, transparent where the land is
// plains. Each biome has a small image of its weights, one pixel to a cell, that
// is stretched smoothly over its texture. Only the part that changed is drawn
// again, so painting stays quick on a big map.
export function createSurface(
  canvas: { width: number; height: number },
  background: SceneBackground,
  scale: number,
  // Painted ground for biomes that have a tile, as pictures at this same scale.
  // The others have the ground the code makes.
  painted: Partial<Record<Biome, HTMLCanvasElement>> = {}
) {
  const { cols, rows } = gridSize(canvas)
  const picture = document.createElement("canvas")
  picture.width = Math.round(canvas.width * scale)
  picture.height = Math.round(canvas.height * scale)
  const context = picture.getContext("2d")!

  const planes = BIOMES.map(() => {
    const plane = document.createElement("canvas")
    plane.width = cols
    plane.height = rows
    return plane
  })
  const tiles = BIOMES.map((biome) => (painted[biome] ? null : biomeTile(biome, background, scale)))
  const scratch = document.createElement("canvas")
  const scratchContext = scratch.getContext("2d")!
  let reading: TileAt = () => undefined
  // The paint the picture was last drawn whole from, so it is not drawn again.
  const state = { drawn: null as Paint | null, touched: false }

  function draw(changed: Cells, tileAt: TileAt) {
    reading = tileAt
    const x0 = Math.max(changed.x0 - REACH, 0)
    const y0 = Math.max(changed.y0 - REACH, 0)
    const x1 = Math.min(changed.x1 + REACH, cols - 1)
    const y1 = Math.min(changed.y1 + REACH, rows - 1)
    const width = x1 - x0 + 1
    const height = y1 - y0 + 1
    const toPicture = (cell: number) => Math.round(cell * PAINT_CELL * scale)
    const dx = toPicture(x0)
    const dy = toPicture(y0)
    const dw = toPicture(x1 + 1) - dx
    const dh = toPicture(y1 + 1) - dy

    const weights = BIOMES.map(() => new ImageData(width, height))
    const present = BIOMES.map(() => false)
    // The tile is looked up only when the cell is in a different one.
    let tile: ReturnType<TileAt>
    let tileX = -1
    let tileY = -1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cx = x0 + x
        const cy = y0 + y
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
    scratch.width = dw
    scratch.height = dh
    for (let c = 0; c < CHANNELS; c++) {
      planes[c].getContext("2d")!.putImageData(weights[c], x0, y0)
      if (!present[c]) continue
      // The texture is laid on first, then cut down to the biome's weights.
      scratchContext.globalCompositeOperation = "source-over"
      const ground = painted[BIOMES[c]]
      if (ground) {
        scratchContext.setTransform(1, 0, 0, 1, 0, 0)
        scratchContext.drawImage(ground, dx, dy, dw, dh, 0, 0, dw, dh)
      } else {
        scratchContext.setTransform(1, 0, 0, 1, -dx, -dy)
        scratchContext.fillStyle = scratchContext.createPattern(tiles[c]!, "repeat")!
        scratchContext.fillRect(dx, dy, dw, dh)
        scratchContext.setTransform(1, 0, 0, 1, 0, 0)
      }
      scratchContext.globalCompositeOperation = "destination-in"
      scratchContext.imageSmoothingEnabled = true
      scratchContext.drawImage(planes[c], x0, y0, width, height, 0, 0, dw, dh)
      context.drawImage(scratch, dx, dy)
    }
  }

  function drawAll(paint: Paint) {
    context.clearRect(0, 0, picture.width, picture.height)
    for (const plane of planes) plane.getContext("2d")!.clearRect(0, 0, cols, rows)
    const at: TileAt = (key) => paint.get(key)
    for (const key of paint.keys()) {
      const [tx, ty] = key.split(",").map(Number)
      draw({ x0: tx * TILE, y0: ty * TILE, x1: (tx + 1) * TILE - 1, y1: (ty + 1) * TILE - 1 }, at)
    }
    reading = at
    state.drawn = paint
    state.touched = paint.size > 0
  }

  // The picture already shows this paint, as a stroke leaves it, so what reads
  // the weights must stop reading the stroke.
  function adopt(paint: Paint) {
    reading = (key) => paint.get(key)
    state.drawn = paint
    state.touched = state.touched || paint.size > 0
  }

  // How much of each biome is at a point of the canvas, 0 to 1, in biome order;
  // null where there is none.
  function weightsAt(x: number, y: number) {
    const cx = Math.min(Math.max(Math.floor(x / PAINT_CELL), 0), cols - 1)
    const cy = Math.min(Math.max(Math.floor(y / PAINT_CELL), 0), rows - 1)
    const tile = reading(`${Math.floor(cx / TILE)},${Math.floor(cy / TILE)}`)
    if (!tile) return null
    const cell = ((cy % TILE) * TILE + (cx % TILE)) * CHANNELS
    return BIOMES.map((_, c) => tile[cell + c] / 255)
  }

  return { picture, draw, drawAll, adopt, weightsAt, state }
}

export type Surface = ReturnType<typeof createSurface>
