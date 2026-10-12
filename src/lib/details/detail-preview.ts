import { canvasOf, strokeShape } from "../biomes/brush-preview"
import type { SceneBackground } from "../map-scene"
import { gradedTile } from "../terrain-texture"
import { loadTiles } from "../terrain-tiles"
import { detailTile } from "./detail-texture"
import { DETAILS, RIVER } from "./details"
import type { Detail } from "./details"

export type DetailPreviews = Record<Detail, string>

// How many pixels of the sub tool list a tile of ground is across.
const TILE_SHOWN = 96

const made = new Map<string, DetailPreviews>()

// A picture of each detail's brush, drawn once for each background and screen density: the
// stroke's shape cut from the detail's ground, as the biomes' rows are. The river's ground is the
// sea's, as the map draws it, graded for the background.
export async function detailPreviews(background: SceneBackground): Promise<DetailPreviews> {
  const density = window.devicePixelRatio || 1
  const key = `${background}@${density}`
  const known = made.get(key)
  if (known) return known
  const [shape, tiles] = await Promise.all([strokeShape(density), loadTiles()])
  const previews = Object.fromEntries(
    DETAILS.map((detail) => {
      const out = canvasOf(shape.width, shape.height)
      const context = out.getContext("2d")!
      if (DETAILS.indexOf(detail) === RIVER) {
        const sea = gradedTile(tiles.sea, background)
        const pattern = context.createPattern(sea, "repeat")!
        pattern.setTransform(new DOMMatrix().scale((TILE_SHOWN * density) / sea.width))
        context.fillStyle = pattern
      } else {
        context.fillStyle = context.createPattern(detailTile(detail, Math.round(TILE_SHOWN * density)), "repeat")!
      }
      context.fillRect(0, 0, out.width, out.height)
      context.globalCompositeOperation = "destination-in"
      context.drawImage(shape, 0, 0)
      return [detail, out.toDataURL()]
    })
  ) as DetailPreviews
  made.set(key, previews)
  return previews
}
