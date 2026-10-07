import type { MultiPolygon } from "polygon-clipping"
import { BIOMES, PAINT_CELL, TILE } from "./biomes/biomes"
import { CHANNELS } from "./biomes/paint-tiles"
import type { Paint } from "./biomes/paint-tiles"
import { css } from "./colour"
import { defaultWidth, loadedAssetInfo, assetById } from "./map-assets"
import type { MapScene } from "./map-scene"
import { themeFor } from "./map-theme"
import type { Terrain } from "./terrain"

// The width of the overview, in pixels: small, as it is drawn again after edits.
export const OVERVIEW_WIDTH = 384

export const overviewSize = ({ width, height }: { width: number; height: number }) => ({
  width: OVERVIEW_WIDTH,
  height: Math.max(1, Math.round((OVERVIEW_WIDTH * height) / width)),
})

function tracePath(land: MultiPolygon, scale: number) {
  const path = new Path2D()
  for (const polygon of land) {
    for (const ring of polygon) {
      ring.forEach(([x, y], index) =>
        index === 0 ? path.moveTo(x * scale, y * scale) : path.lineTo(x * scale, y * scale)
      )
      path.closePath()
    }
  }
  return path
}

// How much of each biome there is at each pixel of the overview, as the alpha of
// a picture per biome. Only the tiles that hold paint are visited.
function biomeMasks(paint: Paint, width: number, height: number, scale: number) {
  const masks = BIOMES.map(() => new ImageData(width, height))
  const span = TILE * PAINT_CELL * scale
  for (const [key, tile] of paint) {
    const [tx, ty] = key.split(",").map(Number)
    const x0 = Math.max(0, Math.floor(tx * span))
    const y0 = Math.max(0, Math.floor(ty * span))
    const x1 = Math.min(width, Math.ceil((tx + 1) * span))
    const y1 = Math.min(height, Math.ceil((ty + 1) * span))
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const cx = Math.min(TILE - 1, Math.max(0, Math.floor((x + 0.5) / scale / PAINT_CELL) - tx * TILE))
        const cy = Math.min(TILE - 1, Math.max(0, Math.floor((y + 0.5) / scale / PAINT_CELL) - ty * TILE))
        const at = (cy * TILE + cx) * CHANNELS
        for (let channel = 0; channel < CHANNELS; channel++) masks[channel].data[(y * width + x) * 4 + 3] = tile[at + channel]
      }
    }
  }
  return masks
}

function scratch(width: number, height: number) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

// The whole map, small: the sea, the land with its biomes (from the painted ground
// the editor already has), the coast, and each piece of art as a blot of ink the
// size it is. It is not the map as it is published, only enough to find a place
// in it, and cheap enough to be drawn again a moment after an edit.
export function drawOverview(canvas: HTMLCanvasElement, scene: MapScene, terrain: Terrain) {
  const { width, height } = canvas
  const scale = width / scene.canvas.width
  const theme = themeFor(scene.canvas.background)
  const context = canvas.getContext("2d")!
  context.clearRect(0, 0, width, height)
  context.imageSmoothingQuality = "medium"
  context.drawImage(terrain.sea, 0, 0, width, height)

  if (scene.land.length > 0) {
    const path = tracePath(scene.land, scale)
    context.save()
    context.clip(path, "evenodd")
    context.drawImage(terrain.land, 0, 0, width, height)
    if (scene.paint.size > 0) {
      const masks = biomeMasks(scene.paint, width, height, scale)
      BIOMES.forEach((biome, index) => {
        if (!masks[index].data.some((value, at) => at % 4 === 3 && value > 0)) return
        const layer = scratch(width, height)
        const layerContext = layer.getContext("2d")!
        layerContext.drawImage(terrain.biomes[biome], 0, 0, width, height)
        const mask = scratch(width, height)
        mask.getContext("2d")!.putImageData(masks[index], 0, 0)
        layerContext.globalCompositeOperation = "destination-in"
        layerContext.drawImage(mask, 0, 0)
        context.drawImage(layer, 0, 0)
      })
    }
    context.restore()
    context.strokeStyle = css(theme.ink)
    context.globalAlpha = 0.8
    context.lineWidth = 1
    context.stroke(path)
    context.globalAlpha = 1
  }

  context.fillStyle = css(theme.ink)
  context.globalAlpha = 0.45
  for (const piece of scene.assets) {
    const info = loadedAssetInfo(piece.asset)
    const category = assetById(piece.asset)?.category
    // Size of what is painted, as it is placed; before the art has loaded, the usual.
    const across = info ? info.trim.width * Math.abs(piece.scaleX) : category ? defaultWidth(category) : 0
    const down = info ? info.trim.height * Math.abs(piece.scaleY) : across
    if (across === 0) continue
    context.beginPath()
    context.ellipse(piece.x * scale, piece.y * scale, Math.max(1, (across * scale) / 2), Math.max(1, (down * scale) / 2), (piece.rotation * Math.PI) / 180, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1
}
