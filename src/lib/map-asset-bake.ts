import { at } from "./temp-timing" // TEMP-TIMING
import { css } from "./colour"
import type { Rgb } from "./colour"
import { artFor } from "./map-asset-art"
import { inkField } from "./map-asset-ink"
import { drawPainted } from "./map-asset-painted"
import { place, room } from "./map-asset-place"
import { inkFollows } from "./map-assets"
import type { Piece, Rect } from "./map-asset-pieces"
import { drawGround } from "./map-ground"
import type { Ground } from "./map-ground"

// A picture of part of the canvas: its canvas, the canvas point at its top left,
// and how many of its pixels go to one canvas pixel.
export type Picture = { canvas: HTMLCanvasElement; x: number; y: number; scale: number }

// The fill is what a piece looks like in flat colour while it is moved. The ink
// is the map's own, and is taken toward the ground's ink where there is paint.
export type Colours = { ink: Rgb; fill: Rgb }

// The canvases a bake works on. A bake that is paused between pieces has its own,
// so that an edit drawn meanwhile cannot overwrite what it has half made.
export type Scratch = { ground: HTMLCanvasElement; piece: HTMLCanvasElement }
export const makeScratch = (): Scratch => ({
  ground: document.createElement("canvas"),
  piece: document.createElement("canvas"),
})
const shared = makeScratch()

// Draws the pieces that touch a rectangle of the canvas into a picture, back to
// front, in place of what was there. "pieces" are those pieces, in order. Each
// piece is first the ground, cut to its shape, so that what is behind it is
// covered by ground and not by white, and then its ink on top. Everything that
// is not in the rectangle is left alone, so a change costs only what is near it.
// It is done a piece at a time: the steps pause after each, so that a long bake
// can be spread over time (see bakeAll).
export const TIMING = { ground: 0, ink: 0, pieces: 0, count: 0 } // TEMP-TIMING
export function* bakeSteps(
  picture: Picture,
  rect: Rect,
  pieces: Piece[],
  ground: Ground,
  colours: Colours,
  scratch: Scratch = shared
): Generator<void> {
  const { scale } = picture
  const width = picture.canvas.width
  const height = picture.canvas.height
  const x0 = Math.max(Math.floor((rect.x - picture.x) * scale), 0)
  const y0 = Math.max(Math.floor((rect.y - picture.y) * scale), 0)
  const x1 = Math.min(Math.ceil((rect.x + rect.width - picture.x) * scale), width)
  const y1 = Math.min(Math.ceil((rect.y + rect.height - picture.y) * scale), height)
  if (x1 <= x0 || y1 <= y0) return
  const context = picture.canvas.getContext("2d")!
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(x0, y0, x1 - x0, y1 - y0)
  if (pieces.length === 0) return

  // The ground under the whole rectangle, once.
  const behind = scratch.ground
  room(behind, x1 - x0, y1 - y0)
  const behindContext = behind.getContext("2d")!
  behindContext.setTransform(1, 0, 0, 1, 0, 0)
  behindContext.clearRect(0, 0, x1 - x0, y1 - y0)
  const tG = performance.now() // TEMP-TIMING
  drawGround(
    behindContext,
    { x: picture.x + x0 / scale, y: picture.y + y0 / scale, width: (x1 - x0) / scale, height: (y1 - y0) / scale },
    scale,
    ground
  )
  TIMING.ground += performance.now() - tG // TEMP-TIMING

  context.save()
  try {
    context.beginPath()
    context.rect(x0, y0, x1 - x0, y1 - y0)
    context.clip()
    context.imageSmoothingQuality = "high"
    // The colour of the ink at each place of the rectangle, for each of the amounts
    // that kinds of art follow the ground by; null where it is one flat colour.
    const rectOnCanvas = { x: picture.x + x0 / scale, y: picture.y + y0 / scale, width: (x1 - x0) / scale, height: (y1 - y0) / scale }
    const fields = new Map<number, HTMLCanvasElement | null>()
    const fieldFor = (follows: number) => {
      if (!fields.has(follows)) {
        const tI = performance.now() // TEMP-TIMING
        fields.set(follows, inkField(rectOnCanvas, ground, colours.ink, follows))
        TIMING.ink += performance.now() - tI // TEMP-TIMING
      }
      return fields.get(follows)!
    }
    const cut = scratch.piece
    const cutContext = cut.getContext("2d")!
    cutContext.imageSmoothingQuality = "high"
    for (const piece of pieces) {
      yield
      const { asset, info, box } = piece
      // The part of the picture the piece covers, inside the rectangle.
      const bx0 = Math.max(Math.floor((box.x - picture.x) * scale), x0)
      const by0 = Math.max(Math.floor((box.y - picture.y) * scale), y0)
      const bx1 = Math.min(Math.ceil((box.x + box.width - picture.x) * scale), x1)
      const by1 = Math.min(Math.ceil((box.y + box.height - picture.y) * scale), y1)
      if (bx1 <= bx0 || by1 <= by0) continue

      const w = bx1 - bx0
      const h = by1 - by0
      room(cut, w, h)
      // Painted art is drawn as painted, over what is behind it: no ground shows
      // through it, and its ink does not follow the ground.
      if (info.colour) {
        drawPainted(context, cut, cutContext, picture, piece, ground, { x: bx0, y: by0, width: w, height: h })
        continue
      }
      const art = artFor(
        asset.asset,
        info,
        info.trim.width * Math.abs(asset.scaleX) * scale,
        colours.ink,
        colours.fill
      )
      cutContext.setTransform(1, 0, 0, 1, 0, 0)
      cutContext.globalCompositeOperation = "source-over"
      cutContext.clearRect(0, 0, w, h)
      place(cutContext, picture, piece, bx0, by0)
      cutContext.drawImage(art.solid, 0, 0, info.trim.width, info.trim.height)
      cutContext.setTransform(1, 0, 0, 1, 0, 0)
      cutContext.globalCompositeOperation = "source-in"
      cutContext.drawImage(behind, bx0 - x0, by0 - y0, w, h, 0, 0, w, h)
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.drawImage(cut, 0, 0, w, h, bx0, by0, w, h)

      // The ink: its lines cut out of the colour of the ink there, so that it
      // changes along a piece as the ground under it changes.
      const field = fieldFor(inkFollows(asset.asset.split("/")[0]))
      cutContext.setTransform(1, 0, 0, 1, 0, 0)
      cutContext.globalCompositeOperation = "source-over"
      cutContext.clearRect(0, 0, w, h)
      place(cutContext, picture, piece, bx0, by0)
      cutContext.drawImage(art.ink, 0, 0, info.trim.width, info.trim.height)
      cutContext.setTransform(1, 0, 0, 1, 0, 0)
      cutContext.globalCompositeOperation = "source-in"
      if (field) {
        const across = field.width / (x1 - x0)
        const down = field.height / (y1 - y0)
        cutContext.drawImage(field, (bx0 - x0) * across, (by0 - y0) * down, w * across, h * down, 0, 0, w, h)
      } else {
        cutContext.fillStyle = css(colours.ink)
        cutContext.fillRect(0, 0, w, h)
      }
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.drawImage(cut, 0, 0, w, h, bx0, by0, w, h)
    }
  } finally {
    context.restore()
  }
}

// All of it at once, for edits that must show at once.
export function bakeRect(picture: Picture, rect: Rect, pieces: Piece[], ground: Ground, colours: Colours) {
  const t0 = performance.now() // TEMP-TIMING
  TIMING.ground = TIMING.ink = 0
  const steps = bakeSteps(picture, rect, pieces, ground, colours)
  while (!steps.next().done);
  const total = performance.now() - t0 // TEMP-TIMING
  console.log(`${at()} [bakeRect] total ${total.toFixed(1)}ms | ground ${TIMING.ground.toFixed(1)} | ink ${TIMING.ink.toFixed(1)} | pieces(rest) ${(total - TIMING.ground - TIMING.ink).toFixed(1)} | n=${pieces.length} px=${Math.round(rect.width * picture.scale)}x${Math.round(rect.height * picture.scale)} scale=${picture.scale.toFixed(2)}`) // TEMP-TIMING
}
