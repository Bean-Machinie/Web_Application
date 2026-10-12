import type { MultiPolygon } from "polygon-clipping"
import { traceLand } from "../map-land-trace"
import { DETAIL_REACH } from "./details"

// The painted weights are soft at the edge, as a brush's are; a river has a clean edge, so a
// weight is taken for water from LOW, and fully from HIGH, smoothly between: the edge
// is where the weight is about a quarter, a little inside where the brush's ring is, and
// sharp to the pixel at any zoom.
const LOW = 0.18
const HIGH = 0.32
// The bank's ink is laid by copying the water round it, from this many sides.
const BANK_COPIES = 12
// How soft the water's end out at sea is, as a share of the reach.
const FADE = 1 / 3.5

const smooth = (low: number, high: number, value: number) => {
  const t = Math.min(Math.max((value - low) / (high - low), 0), 1)
  return t * t * (3 - 2 * t)
}

const canvasOf = () => document.createElement("canvas")

type Box = { x: number; y: number; width: number; height: number }

// What a river is drawn with: the sea's own ground, which it is water of, and the land it cuts
// through. It is made to look as if the land were cut by it, with the land itself left as it
// is: the water is the sea's ground, with a bank of ink on the land side of its edge, as the
// coast has; where it comes to the coast it covers the coast's ink, so the coast is open
// there; and it runs on out into the sea, fading into it, so the mouth is not a plug of one
// texture in the shore's shading. "scale" is how many pixels of its picture go to a canvas
// pixel, and "sea" the sea's ground as a picture of the same scale.
export function createRiverPainter(scale: number, sea: HTMLCanvasElement) {
  // What is made of the land, at the picture's size: where the bank may be, and how far out to
  // sea the water is let go.
  const reach = canvasOf()
  const onLand = canvasOf()
  let made: MultiPolygon | null = null
  let land: MultiPolygon | null = null
  let look = { ink: "#000", width: 2 }

  const mask = canvasOf()
  const bank = canvasOf()
  const water = canvasOf()

  function ensureLand(size: { width: number; height: number }) {
    if (made === land || !land) return
    made = land
    for (const canvas of [reach, onLand]) {
      canvas.width = size.width
      canvas.height = size.height
    }
    const flat = onLand.getContext("2d")!
    flat.setTransform(scale, 0, 0, scale, 0, 0)
    traceLand(flat, land)
    flat.fillStyle = "#fff"
    flat.fill("evenodd")

    // The land and what is within the reach of it, whole, and then softened at its far edge
    // so that the water is whole at the coast and gone out in the sea.
    const wide = canvasOf()
    wide.width = size.width
    wide.height = size.height
    const wideContext = wide.getContext("2d")!
    wideContext.setTransform(scale, 0, 0, scale, 0, 0)
    traceLand(wideContext, land)
    wideContext.fillStyle = "#fff"
    wideContext.fill("evenodd")
    wideContext.strokeStyle = "#fff"
    wideContext.lineWidth = DETAIL_REACH * 2
    wideContext.lineJoin = "round"
    wideContext.stroke()
    const softened = reach.getContext("2d")!
    softened.filter = `blur(${DETAIL_REACH * scale * FADE}px)`
    softened.drawImage(wide, 0, 0)
    softened.filter = "none"
  }

  return {
    // The land and the ink the river is drawn with; true if any is not what it was, and
    // so what was drawn is to be drawn again.
    setLook(next: MultiPolygon, ink: string, width: number) {
      const changed = land !== next || look.ink !== ink || look.width !== width
      land = next
      look = { ink, width }
      return changed
    },

    // Draws the river on "target", over the pixels "inner" of the picture. "plane" holds the
    // weights, one pixel to a cell, and "source" is the part of it that is read; "read" is
    // where in the picture that is, a little more than "inner", for the smoothing and the
    // bank to have what is round them.
    paint(target: CanvasRenderingContext2D, plane: HTMLCanvasElement, source: Box, read: Box, inner: Box, size: { width: number; height: number }) {
      if (!land) return
      ensureLand(size)
      const { x, y, width, height } = read
      for (const canvas of [mask, bank, water]) {
        canvas.width = width
        canvas.height = height
      }
      const maskContext = mask.getContext("2d", { willReadFrequently: true })!
      maskContext.imageSmoothingEnabled = true
      maskContext.drawImage(plane, source.x, source.y, source.width, source.height, 0, 0, width, height)
      const image = maskContext.getImageData(0, 0, width, height)
      for (let at = 0; at < image.data.length; at += 4) {
        image.data[at] = image.data[at + 1] = image.data[at + 2] = 255
        image.data[at + 3] = Math.round(smooth(LOW, HIGH, image.data[at + 3] / 255) * 255)
      }
      maskContext.putImageData(image, 0, 0)

      // The bank: the water copied round itself, less the water, in ink, only on the land.
      const bankContext = bank.getContext("2d")!
      const thickness = Math.max(look.width * scale, 1)
      for (let copy = 0; copy < BANK_COPIES; copy++) {
        const turn = (copy / BANK_COPIES) * Math.PI * 2
        bankContext.drawImage(mask, Math.cos(turn) * thickness, Math.sin(turn) * thickness)
      }
      bankContext.globalCompositeOperation = "destination-out"
      bankContext.drawImage(mask, 0, 0)
      bankContext.globalCompositeOperation = "source-in"
      bankContext.fillStyle = look.ink
      bankContext.fillRect(0, 0, width, height)
      bankContext.globalCompositeOperation = "destination-in"
      bankContext.drawImage(onLand, x, y, width, height, 0, 0, width, height)

      // The water: the sea's own ground, where the paint is, as far out to sea as it is let go.
      maskContext.globalCompositeOperation = "destination-in"
      maskContext.drawImage(reach, x, y, width, height, 0, 0, width, height)
      const waterContext = water.getContext("2d")!
      waterContext.drawImage(sea, x, y, width, height, 0, 0, width, height)
      waterContext.globalCompositeOperation = "destination-in"
      waterContext.drawImage(mask, 0, 0)

      const from = { sx: inner.x - x, sy: inner.y - y }
      target.drawImage(bank, from.sx, from.sy, inner.width, inner.height, inner.x, inner.y, inner.width, inner.height)
      target.drawImage(water, from.sx, from.sy, inner.width, inner.height, inner.x, inner.y, inner.width, inner.height)
    },
  }
}

export type RiverPainter = ReturnType<typeof createRiverPainter>
