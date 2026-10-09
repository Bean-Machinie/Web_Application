import { boxOf, indexPieces } from "./map-asset-pieces"
import type { Piece, Rect } from "./map-asset-pieces"

// Finds placed art by place, without a shape for each piece: a grid finds the
// pieces near a point, and the painted shape of the art (what is not empty) says
// whether the point is on it.

type Pair = [number, number]

function inPolygon(x: number, y: number, polygon: Pair[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const side = (a: Pair, b: Pair, c: Pair) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
const cross = (a: Pair, b: Pair, c: Pair, d: Pair) =>
  side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0

// Whether an outline and a box touch: the outline is in the box, the box in the outline,
// or their edges cross.
function touches(box: Rect, polygon: Pair[]) {
  const corners: Pair[] = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x + box.width, box.y + box.height],
    [box.x, box.y + box.height],
  ]
  if (corners.some(([x, y]) => inPolygon(x, y, polygon))) return true
  if (polygon.some(([x, y]) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height)) return true
  return polygon.some((point, i) => {
    const next = polygon[(i + 1) % polygon.length]
    return corners.some((corner, k) => cross(point, next, corner, corners[(k + 1) % 4]))
  })
}

const context = document.createElement("canvas").getContext("2d")!

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

// Whether a point of the canvas is on the painted part of a piece: taken back
// through the piece's turn and scale to the art's own pixels.
function painted({ asset, info }: Piece, x: number, y: number) {
  const turn = (asset.rotation * Math.PI) / 180
  const dx = x - asset.x
  const dy = y - asset.y
  const localX = (dx * Math.cos(turn) + dy * Math.sin(turn)) / asset.scaleX + info.trim.width / 2
  const localY = (dy * Math.cos(turn) - dx * Math.sin(turn)) / asset.scaleY + info.trim.height / 2
  return context.isPointInPath(info.hit, localX, localY)
}

export function makePicker(pieces: Piece[], canvas: { width: number; height: number }) {
  const near = indexPieces(pieces, canvas)
  return {
    // The id of the piece in front at a point, or null where there is none.
    at(x: number, y: number) {
      const found = near({ x: x - 1, y: y - 1, width: 2, height: 2 })
      for (let i = found.length - 1; i >= 0; i--) if (painted(found[i], x, y)) return found[i].asset.id
      return null
    },
    // The ids of the pieces whose boxes touch an outline drawn by hand.
    inside(outline: Pair[]) {
      const xs = outline.map(([x]) => x)
      const ys = outline.map(([, y]) => y)
      const bounds = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
      return near(bounds)
        .filter(({ asset, info }) => touches(boxOf(asset, info.trim), outline))
        .map(({ asset }) => asset.id)
    },
    // The ids of the pieces whose boxes touch an area.
    within(area: Rect) {
      return near(area)
        .filter(({ asset, info }) => overlaps(boxOf(asset, info.trim), area))
        .map(({ asset }) => asset.id)
    },
  }
}

export type AssetPicker = ReturnType<typeof makePicker>
