import type { MultiPolygon } from "polygon-clipping"
import type { Paint } from "./biomes/paint-tiles"
import { traceLand } from "./map-land-trace"
import type { Rect } from "./map-asset-pieces"
import type { SceneBackground } from "./map-scene"

// What the ground is made of.
export type Ground = {
  canvas: { width: number; height: number }
  background: SceneBackground
  // The painted sea under everything, of any size.
  backdrop: HTMLCanvasElement
  // The painted land, of any size, used as painted.
  landTexture: HTMLCanvasElement
  // The land as it is shown, rounded.
  land: MultiPolygon
  // The biome paint, read when art picks its ink. A box so that it can change
  // without the ground being a different one.
  paint: { current: Paint }
  // The biomes' picture, of any size, drawn over the land; none if nothing is painted.
  biomes: HTMLCanvasElement | null
}

// Draws the ground of a rectangle of the canvas into a context, at "scale"
// pixels to each canvas pixel, with the rectangle's top left at the context's
// origin. Only what the ground is made of: the sea, and on land the land and
// its biomes. The coast's ink, the sea's lines and the
// land's shadow are not ground, so art drawn over the coast covers them.
export function drawGround(context: CanvasRenderingContext2D, rect: Rect, scale: number, ground: Ground) {
  const { canvas, backdrop, land, biomes } = ground
  context.save()
  context.setTransform(scale, 0, 0, scale, -rect.x * scale, -rect.y * scale)
  context.imageSmoothingQuality = "high"

  // The backdrop may be a picture of any size, so it is read by shares of it.
  const sideways = backdrop.width / canvas.width
  const down = backdrop.height / canvas.height
  context.drawImage(
    backdrop,
    rect.x * sideways,
    rect.y * down,
    rect.width * sideways,
    rect.height * down,
    rect.x,
    rect.y,
    rect.width,
    rect.height
  )

  if (land.length > 0) {
    traceLand(context, land)
    const texture = ground.landTexture
    context.save()
    context.clip("evenodd")
    const across = texture.width / canvas.width
    const high = texture.height / canvas.height
    context.drawImage(
      texture,
      rect.x * across,
      rect.y * high,
      rect.width * across,
      rect.height * high,
      rect.x,
      rect.y,
      rect.width,
      rect.height
    )
    context.restore()
    if (biomes) {
      context.save()
      context.clip("evenodd")
      const across = biomes.width / canvas.width
      const high = biomes.height / canvas.height
      context.drawImage(
        biomes,
        rect.x * across,
        rect.y * high,
        rect.width * across,
        rect.height * high,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      )
      context.restore()
    }
  }
  context.restore()
}
