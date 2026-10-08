import { BIOMES } from "./biomes/biomes"
import { weightsAtPoint } from "./biomes/paint-tiles"
import type { Paint } from "./biomes/paint-tiles"
import type { Picture } from "./map-asset-bake"
import { paintedArtFor } from "./map-asset-paint"
import type { PaintedArt } from "./map-asset-paint"
import { place } from "./map-asset-place"
import type { Piece, Rect } from "./map-asset-pieces"
import { castsShadow, recolours } from "./map-assets"
import type { SceneBackground } from "./map-scene"
import type { Ground } from "./map-ground"

type Footed = Pick<Piece, "asset" | "info">

// How much of each biome is at the foot of a piece, from three points along it.
function weightsAtFoot({ asset, info }: Footed, paint: Paint) {
  const width = info.trim.width * Math.abs(asset.scaleX)
  const y = asset.y + (info.trim.height * Math.abs(asset.scaleY)) / 2 - 2
  const sums = BIOMES.map(() => 0)
  for (const across of [-0.25, 0, 0.25]) {
    const weights = weightsAtPoint(paint, asset.x + across * width, y)
    weights?.forEach((weight, biome) => (sums[biome] += weight / 3))
  }
  return sums
}

// The versions of the art for the biomes at a piece's foot, each with how much of
// it to lay over the painting. What no biome covers is plains, which keeps the
// painting as it is.
function versionsAtFoot(piece: Footed, art: PaintedArt, paint: Paint) {
  const layers: [HTMLCanvasElement, number][] = []
  const weights = weightsAtFoot(piece, paint)
  let used = Math.max(1 - weights.reduce((sum, weight) => sum + weight, 0), 0)
  BIOMES.forEach((biome, index) => {
    if (weights[index] <= 0.01) return
    used += weights[index]
    const version = art.variant(biome)
    if (version) layers.push([version, weights[index] / used])
  })
  return layers
}

// Draws a piece of painted art into a picture: its shadow, then the art as it
// was painted, or, where biomes are painted under a piece of a kind that
// changes colour, the art taken toward each biome's version by how much of that
// biome is at its foot. The versions are laid over the painting only where it
// has paint, so its shape and edges are not touched. "box" is the part of the
// picture the piece covers, in the picture's pixels.
export function drawPainted(
  context: CanvasRenderingContext2D,
  cut: HTMLCanvasElement,
  cutContext: CanvasRenderingContext2D,
  picture: Picture,
  piece: Piece,
  ground: Ground,
  box: Rect
) {
  const { asset, info } = piece
  const category = asset.asset.split("/")[0]
  const changes = recolours(category)
  const art = paintedArtFor(
    asset.asset,
    category,
    info,
    info.trim.width * Math.abs(asset.scaleX) * picture.scale,
    ground.background,
    changes
  )

  // The shadow keeps to the ground: it is not turned or flipped with the art.
  const k = info.trim.width / art.width
  const { shadow } = art
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.scale(picture.scale, picture.scale)
  context.translate(asset.x - picture.x, asset.y - picture.y)
  context.scale(Math.abs(asset.scaleX), Math.abs(asset.scaleY))
  context.translate(-info.trim.width / 2, -info.trim.height / 2)
  if (castsShadow(category))
    context.drawImage(shadow.canvas, shadow.left * k, shadow.top * k, shadow.canvas.width * k, shadow.canvas.height * k)

  const layers = changes ? versionsAtFoot(piece, art, ground.paint.current) : []

  if (layers.length === 0) {
    place(context, picture, piece, 0, 0)
    context.drawImage(art.base, 0, 0, info.trim.width, info.trim.height)
    return
  }
  cutContext.setTransform(1, 0, 0, 1, 0, 0)
  cutContext.globalCompositeOperation = "source-over"
  cutContext.globalAlpha = 1
  cutContext.clearRect(0, 0, box.width, box.height)
  place(cutContext, picture, piece, box.x, box.y)
  cutContext.drawImage(art.base, 0, 0, info.trim.width, info.trim.height)
  // Laid on with "source-atop", which keeps the painting's own shape and edges.
  cutContext.globalCompositeOperation = "source-atop"
  for (const [version, amount] of layers) {
    cutContext.globalAlpha = amount
    cutContext.drawImage(version, 0, 0, info.trim.width, info.trim.height)
  }
  cutContext.globalAlpha = 1
  cutContext.globalCompositeOperation = "source-over"
  cutContext.setTransform(1, 0, 0, 1, 0, 0)
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.drawImage(cut, 0, 0, box.width, box.height, box.x, box.y, box.width, box.height)
}

const flat = document.createElement("canvas")

// The art of a piece as it looks where it stands, with no shadow: for drawing it
// while it is moved, in the colours of the biome it is over. The canvas is reused,
// so it is only good until the next call.
export function lookAt(piece: Footed, paint: Paint, background: SceneBackground, drawnWidth: number) {
  const category = piece.asset.asset.split("/")[0]
  const changes = recolours(category)
  const art = paintedArtFor(piece.asset.asset, category, piece.info, drawnWidth, background, changes)
  const layers = changes ? versionsAtFoot(piece, art, paint) : []
  if (layers.length === 0) return art.base
  flat.width = art.base.width
  flat.height = art.base.height
  const context = flat.getContext("2d")!
  context.drawImage(art.base, 0, 0)
  context.globalCompositeOperation = "source-atop"
  for (const [version, amount] of layers) {
    context.globalAlpha = amount
    context.drawImage(version, 0, 0, flat.width, flat.height)
  }
  context.globalAlpha = 1
  context.globalCompositeOperation = "source-over"
  return flat
}
