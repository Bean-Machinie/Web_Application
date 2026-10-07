import { bottomEdge } from "./map-asset-edit"
import type { AssetInfo } from "./map-assets"
import type { PlacedAsset } from "./map-scene"

export type Rect = { x: number; y: number; width: number; height: number }

// A placed piece of art that can be drawn: the placement, what was worked out
// about its picture, and the box it covers on the canvas.
export type Piece = { asset: PlacedAsset; info: AssetInfo; box: Rect }

// The box a piece covers on the canvas, with a pixel to spare for soft edges.
export function boxOf(asset: PlacedAsset, { width, height }: { width: number; height: number }): Rect {
  const turn = (asset.rotation * Math.PI) / 180
  const w = Math.abs(asset.scaleX) * width
  const h = Math.abs(asset.scaleY) * height
  const halfX = (Math.abs(Math.cos(turn)) * w + Math.abs(Math.sin(turn)) * h) / 2 + 1
  const halfY = (Math.abs(Math.sin(turn)) * w + Math.abs(Math.cos(turn)) * h) / 2 + 1
  return { x: asset.x - halfX, y: asset.y - halfY, width: halfX * 2, height: halfY * 2 }
}

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

// The pieces to draw, back to front: lowest on the map is in front, and equal
// ones keep the order they were placed in. Art that has not loaded, and the
// pieces named in "hidden" (those being moved, which draw themselves), are left
// out.
export function makePieces(
  assets: PlacedAsset[],
  infoOf: (id: string) => AssetInfo | undefined,
  hidden: ReadonlySet<string>
): Piece[] {
  const pieces: Piece[] = []
  for (const asset of assets) {
    const info = infoOf(asset.asset)
    if (info && !hidden.has(asset.id)) pieces.push({ asset, info, box: boxOf(asset, info.trim) })
  }
  const bottom = (piece: Piece) => bottomEdge(piece.asset, piece.info.trim.width, piece.info.trim.height)
  return pieces.sort((a, b) => bottom(a) - bottom(b))
}

// Pieces are found by place through a grid, so asking what is in a corner of a
// big map does not look at every piece.
const CELL = 256

export function indexPieces(pieces: Piece[], canvas: { width: number; height: number }) {
  const cols = Math.ceil(canvas.width / CELL)
  const rows = Math.ceil(canvas.height / CELL)
  const grid = new Map<number, number[]>()
  const range = (box: Rect) => ({
    x0: Math.max(Math.floor(box.x / CELL), 0),
    y0: Math.max(Math.floor(box.y / CELL), 0),
    x1: Math.min(Math.floor((box.x + box.width) / CELL), cols - 1),
    y1: Math.min(Math.floor((box.y + box.height) / CELL), rows - 1),
  })
  pieces.forEach((piece, order) => {
    const { x0, y0, x1, y1 } = range(piece.box)
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const key = cy * cols + cx
        const list = grid.get(key)
        if (list) list.push(order)
        else grid.set(key, [order])
      }
    }
  })

  // The pieces that touch a rectangle, back to front.
  return (rect: Rect) => {
    const { x0, y0, x1, y1 } = range(rect)
    const found = new Set<number>()
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        for (const order of grid.get(cy * cols + cx) ?? []) found.add(order)
      }
    }
    return [...found].sort((a, b) => a - b).map((order) => pieces[order]).filter((p) => overlaps(p.box, rect))
  }
}
