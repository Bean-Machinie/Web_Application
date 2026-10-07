import type Konva from "konva"
import { bakeAll, blankPicture } from "./map-asset-pictures"
import type { Picture } from "./map-asset-bake"
import { indexPieces, makePieces } from "./map-asset-pieces"
import { loadAssetInfo, loadedAssetInfo } from "./map-assets"
import { smoothLand } from "./map-coast-smooth"
import type { Ground } from "./map-ground"
import type { Terrain } from "./terrain"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"
import { themeFor } from "./map-theme"

// The builder draws the placed art for the screen. The published picture is
// larger, so the art is drawn again for it, from the same pieces and the same
// ground, at that size: the ink is made from the artwork at the size it ends up,
// so it is as sharp as the picture allows. Null if there is nothing to draw.
export async function exportAssets(
  scene: MapScene,
  biomes: HTMLCanvasElement | null,
  terrain: Terrain
): Promise<Picture | null> {
  const { canvas } = scene
  await Promise.all(scene.assets.map((asset) => loadAssetInfo(asset.asset)))
  const pieces = makePieces(scene.assets, loadedAssetInfo, new Set())
  if (pieces.length === 0) return null

  const ground: Ground = {
    canvas,
    background: canvas.background,
    backdrop: terrain.sea,
    landTexture: terrain.land,
    land: smoothLand(scene.land, scene.style.roundness, canvas),
    paint: { current: scene.paint },
    biomes,
  }
  const theme = themeFor(canvas.background)
  const picture = blankPicture({ x: 0, y: 0, width: canvas.width, height: canvas.height }, renderScale(canvas))
  const colours = { ink: theme.ink, fill: theme.land.fill }
  await bakeAll(picture, { pieces, near: indexPieces(pieces, canvas), ground, colours })
  return picture
}

// Puts that picture in place of the screen's for the instant of drawing. The
// returned function puts the screen's back.
export function sharpAssets(stage: Konva.Stage, picture: Picture | null) {
  const overview = stage.findOne<Konva.Image>(".assets-overview")
  const sharp = stage.findOne<Konva.Image>(".assets-view")
  if (!overview || !picture) return () => {}
  const before = { image: overview.image(), visible: overview.visible(), sharp: sharp?.visible() ?? false }
  overview.setAttrs({ image: picture.canvas, visible: true })
  sharp?.visible(false)
  return () => {
    overview.setAttrs({ image: before.image, visible: before.visible })
    sharp?.visible(before.sharp)
  }
}
