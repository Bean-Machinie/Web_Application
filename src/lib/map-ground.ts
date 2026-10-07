import type { MultiPolygon } from "polygon-clipping"
import type { Paint } from "./biomes/paint-tiles"
import { css } from "./colour"
import { traceLand } from "./map-land-trace"
import type { Rect } from "./map-asset-pieces"
import type { SceneBackground } from "./map-scene"
import { themeFor } from "./map-theme"

// What the ground is made of. Textures that have not loaded yet are left out.
export type Ground = {
  canvas: { width: number; height: number }
  background: SceneBackground
  // The sheet or the sea under everything, the size of the canvas.
  backdrop: HTMLCanvasElement
  seaGrain: HTMLImageElement | null
  landGrain: HTMLImageElement | null
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
// origin. Only what the ground is made of: the sea's colour and grain, and on
// land its colour, grain and biomes. The coast's ink, the sea's lines and the
// land's shadow are not ground, so art drawn over the coast covers them.
export function drawGround(context: CanvasRenderingContext2D, rect: Rect, scale: number, ground: Ground) {
  const { canvas, backdrop, land, biomes } = ground
  const theme = themeFor(ground.background)
  context.save()
  context.setTransform(scale, 0, 0, scale, -rect.x * scale, -rect.y * scale)
  context.imageSmoothingQuality = "high"

  context.drawImage(backdrop, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height)
  const grain = (image: HTMLImageElement | null, amount: number, fill: () => void) => {
    if (!image) return
    context.save()
    context.globalCompositeOperation = "overlay"
    context.globalAlpha = amount
    context.fillStyle = context.createPattern(image, "repeat")!
    fill()
    context.restore()
  }
  grain(ground.seaGrain, theme.water.grain, () => context.fillRect(rect.x, rect.y, rect.width, rect.height))

  if (land.length > 0) {
    traceLand(context, land)
    context.fillStyle = css(theme.land.fill)
    context.fill("evenodd")
    grain(ground.landGrain, theme.land.grain, () => context.fill("evenodd"))
    if (biomes) {
      context.save()
      context.clip("evenodd")
      const across = biomes.width / canvas.width
      const down = biomes.height / canvas.height
      context.drawImage(
        biomes,
        rect.x * across,
        rect.y * down,
        rect.width * across,
        rect.height * down,
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
