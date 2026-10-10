import { boxOf } from "./map-asset-pieces"
import type { Rect } from "./map-asset-pieces"
import type { AssetInfo } from "./map-assets"
import type { PlacedAsset } from "./map-scene"

// Moving many pieces by drawing each on every frame is slow, so the pieces being
// moved are drawn once, as they stand, into one picture of a part of the canvas;
// moving them is then moving that picture. One of the pieces, the carrier,
// draws it; the rest draw nothing.
export type Moving = {
  canvas: HTMLCanvasElement
  // Where the picture's top left is on the canvas.
  x: number
  y: number
  width: number
  height: number
  // The pieces drawn into it. A piece outside the part shown is not in it.
  ids: ReadonlySet<string>
  carrier: string
  // Where the carrier stood when the picture was made.
  from: { x: number; y: number }
}

// Most pixels a picture of the moving pieces is made of; sharper than the screen needs.
const MAX_PIXELS = 16_000_000

// "look" is a piece's art in flat colour, good only until the next call. "region" is
// the part of the canvas worth drawing (what is in sight, with room to spare).
export function drawMoving(
  pieces: { asset: PlacedAsset; info: AssetInfo }[],
  look: (asset: PlacedAsset, info: AssetInfo) => HTMLCanvasElement,
  region: Rect,
  scale: number
): Moving | null {
  const boxes = pieces.map(({ asset, info }) => boxOf(asset, info.trim, info.colour))
  const inside = pieces.filter((_, i) => {
    const box = boxes[i]
    return box.x < region.x + region.width && region.x < box.x + box.width && box.y < region.y + region.height && region.y < box.y + box.height
  })
  if (inside.length === 0) return null

  // Only as large as the pieces are together, kept to the part worth drawing.
  const kept = boxes.filter((_, i) => inside.includes(pieces[i]))
  const left = Math.max(Math.min(...kept.map((box) => box.x)), region.x)
  const top = Math.max(Math.min(...kept.map((box) => box.y)), region.y)
  const right = Math.min(Math.max(...kept.map((box) => box.x + box.width)), region.x + region.width)
  const bottom = Math.min(Math.max(...kept.map((box) => box.y + box.height)), region.y + region.height)
  const area = { x: left, y: top, width: right - left, height: bottom - top }

  const k = Math.min(scale, Math.sqrt(MAX_PIXELS / (area.width * area.height)))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.ceil(area.width * k))
  canvas.height = Math.max(1, Math.ceil(area.height * k))
  const context = canvas.getContext("2d")!
  context.imageSmoothingQuality = "high"
  for (const { asset, info } of inside) {
    const { trim } = info
    context.setTransform(k, 0, 0, k, -area.x * k, -area.y * k)
    context.translate(asset.x, asset.y)
    context.rotate((asset.rotation * Math.PI) / 180)
    context.scale(asset.scaleX, asset.scaleY)
    context.translate(-trim.width / 2, -trim.height / 2)
    context.drawImage(look(asset, info), 0, 0, trim.width, trim.height)
  }
  const carrier = inside[0].asset
  return {
    canvas,
    x: area.x,
    y: area.y,
    width: canvas.width / k,
    height: canvas.height / k,
    ids: new Set(inside.map(({ asset }) => asset.id)),
    carrier: carrier.id,
    from: { x: carrier.x, y: carrier.y },
  }
}
