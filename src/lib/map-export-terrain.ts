import type Konva from "konva"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"
import { NO_TERRAIN, makeTerrain } from "./terrain"
import type { Terrain } from "./terrain"
import { loadTiles } from "./terrain-tiles"

// The builder lays the painted ground out for the screen. The published picture
// is larger, so it is laid out again for it, from the same tiles and the same
// seed, so that it is the same ground and as sharp as the picture allows. There
// is none, and nothing is swapped, where no tile has been painted.
export async function exportTerrain(scene: MapScene): Promise<Terrain> {
  const tiles = await loadTiles()
  if (Object.keys(tiles).length === 0) return NO_TERRAIN
  const { canvas } = scene
  return makeTerrain(tiles, canvas, canvas.background, renderScale(canvas))
}

// Puts the larger sea and land in place of the screen's for the instant of
// drawing. The returned function puts the screen's back.
export function sharpTerrain(stage: Konva.Stage, terrain: Terrain) {
  const restores: (() => void)[] = []
  const sea = stage.findOne<Konva.Image>(".sea")
  if (sea && terrain.sea) {
    const before = sea.image()
    sea.image(terrain.sea)
    restores.push(() => sea.image(before))
  }
  const land = stage.findOne<Konva.Shape>(".land-fill")
  if (land && terrain.land) {
    // Konva takes a canvas as well as an image element for a pattern, which its
    // types do not say, so these are set by name.
    const names = ["fillPatternImage", "fillPatternScale", "fillPatternRepeat", "fillPriority"]
    const before = names.map((name) => land.getAttr(name))
    const apply = (values: unknown[]) => names.forEach((name, i) => land.setAttr(name, values[i]))
    apply([terrain.land, { x: 1 / terrain.scale, y: 1 / terrain.scale }, "no-repeat", "pattern"])
    restores.push(() => apply(before))
  }
  return () => restores.forEach((restore) => restore())
}
