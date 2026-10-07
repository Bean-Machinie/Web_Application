import type { Picture } from "./map-asset-bake"
import type { Piece } from "./map-asset-pieces"

// Resizing a canvas throws its memory away, so the one a piece is cut on only
// ever grows, and the part in use is cleared.
export function room(canvas: HTMLCanvasElement, width: number, height: number) {
  if (canvas.width < width || canvas.height < height) {
    canvas.width = Math.max(canvas.width, width)
    canvas.height = Math.max(canvas.height, height)
  }
}

// Sets the context to draw a piece's art, in the art's own pixels, where the
// piece goes in the picture. "offset" is the picture pixel that is the context's
// origin.
export function place(context: CanvasRenderingContext2D, picture: Picture, piece: Piece, offsetX: number, offsetY: number) {
  const { asset, info } = piece
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.translate(-offsetX, -offsetY)
  context.scale(picture.scale, picture.scale)
  context.translate(asset.x - picture.x, asset.y - picture.y)
  context.rotate((asset.rotation * Math.PI) / 180)
  context.scale(asset.scaleX, asset.scaleY)
  context.translate(-info.trim.width / 2, -info.trim.height / 2)
}

