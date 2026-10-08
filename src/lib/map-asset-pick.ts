import { boxOf, indexPieces } from "./map-asset-pieces"
import type { Piece, Rect } from "./map-asset-pieces"

// Finds placed art by place, without a shape for each piece: a grid finds the
// pieces near a point, and the painted shape of the art (what is not empty) says
// whether the point is on it.

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
    // The ids of the pieces whose boxes touch an area.
    within(area: Rect) {
      return near(area)
        .filter(({ asset, info }) => overlaps(boxOf(asset, info.trim), area))
        .map(({ asset }) => asset.id)
    },
  }
}

export type AssetPicker = ReturnType<typeof makePicker>
