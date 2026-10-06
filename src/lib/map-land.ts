import { difference, union } from "polygon-clipping"
import type { MultiPolygon, Pair, Ring } from "polygon-clipping"
import simplify from "@turf/simplify"
import { clipToCanvas } from "./map-land-clip"

// How much of a hand-drawn outline is ironed out is measured on the screen, not
// on the canvas, so zooming in lets you draw finer detail: a wobble smaller than
// this many screen pixels is smoothed away, and no more.
const TOLERANCE_PX = 1.2
// A drawn shape smaller than this, in screen pixels squared, is a slip of the
// hand rather than land.
const MIN_DRAWN_PX = 16
// What is left of land or of a hole after an edit is only dropped when it is
// no longer a shape at all, in canvas pixels squared. Anything a person could
// have drawn at any zoom must survive.
const MIN_LEFT = 4

function area(ring: Ring) {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

const round = ([x, y]: Pair): Pair => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]

// Without slivers smaller than minArea, and with coordinates kept to a
// hundredth of a pixel.
function tidy(shape: MultiPolygon, minArea: number): MultiPolygon {
  return shape
    .filter((polygon) => area(polygon[0]) >= minArea)
    .map((polygon) =>
      polygon.filter((ring, index) => index === 0 || area(ring) >= minArea).map((ring) => ring.map(round))
    )
}

// Resolves overlaps and self-crossings, which a scribble is full of.
const normalize = (shape: MultiPolygon) => (shape.length === 0 ? shape : union(shape))

const geometry = (shape: MultiPolygon) => ({ type: "MultiPolygon" as const, coordinates: shape })

// A dragged outline as clean land, or null when it is too small or too tangled
// to be a shape. The ends are joined, crossings are resolved, the wobble is
// evened out, and whatever lies outside the canvas is cut off. The corners are
// left as drawn: rounding them is how the land is shown (see smoothLand).
// "scale" is how many screen pixels one canvas pixel is, which sets how fine the
// detail kept is.
export function lassoToShape(
  points: Pair[],
  scale: number,
  canvas: { width: number; height: number }
): MultiPolygon | null {
  if (points.length < 4) return null
  try {
    const clean = normalize([[[...points, points[0]]]])
    const even = simplify(geometry(clean), { tolerance: TOLERANCE_PX / scale, highQuality: true })
    const inside = clipToCanvas(normalize(even.coordinates as MultiPolygon), canvas)
    const shape = tidy(inside, MIN_DRAWN_PX / scale ** 2)
    return shape.length > 0 ? shape : null
  } catch {
    return null
  }
}

export function addLand(land: MultiPolygon, shape: MultiPolygon) {
  return tidy(land.length === 0 ? shape : union(land, shape), MIN_LEFT)
}

// Bays, lakes and straits: what the shape covers stops being land.
export function cutLand(land: MultiPolygon, shape: MultiPolygon) {
  return land.length === 0 ? land : tidy(difference(land, shape), MIN_LEFT)
}
