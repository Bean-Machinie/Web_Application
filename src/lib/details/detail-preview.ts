import { canvasOf, strokeShape } from "../biomes/brush-preview"
import { detailTile } from "./detail-texture"
import { DETAILS } from "./details"
import type { Detail } from "./details"

export type DetailPreviews = Record<Detail, string>

// How many pixels of the sub tool list a tile of grain is across.
const TILE_SHOWN = 96

const made = new Map<number, DetailPreviews>()

// A picture of each detail's brush, drawn once for each screen density: the
// stroke's shape cut from the detail's ground, as the biomes' rows are.
export async function detailPreviews(): Promise<DetailPreviews> {
  const density = window.devicePixelRatio || 1
  const known = made.get(density)
  if (known) return known
  const shape = await strokeShape(density)
  const previews = Object.fromEntries(
    DETAILS.map((detail) => {
      const out = canvasOf(shape.width, shape.height)
      const context = out.getContext("2d")!
      context.fillStyle = context.createPattern(detailTile(detail, Math.round(TILE_SHOWN * density)), "repeat")!
      context.fillRect(0, 0, out.width, out.height)
      context.globalCompositeOperation = "destination-in"
      context.drawImage(shape, 0, 0)
      return [detail, out.toDataURL()]
    })
  ) as DetailPreviews
  made.set(density, previews)
  return previews
}
