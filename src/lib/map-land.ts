import { difference, union } from "polygon-clipping"
import type { MultiPolygon, Pair, Ring } from "polygon-clipping"
import polygonSmooth from "@turf/polygon-smooth"
import simplify from "@turf/simplify"

// How rough a hand-drawn outline may be before it is ironed out, in canvas
// pixels, and how many times the corners are then cut for a soft curve.
const TOLERANCE = 4
const SMOOTHING = 3
// What is left of a smoothed curve is thinned a little, to keep scenes small.
const THINNING = 0.6
// Specks smaller than this are not land, nor holes in it.
const MIN_AREA = 800

function area(ring: Ring) {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

const round = ([x, y]: Pair): Pair => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]

// Without specks, and with coordinates kept to a tenth of a pixel.
function tidy(shape: MultiPolygon): MultiPolygon {
  return shape
    .filter((polygon) => area(polygon[0]) >= MIN_AREA)
    .map((polygon) =>
      polygon.filter((ring, index) => index === 0 || area(ring) >= MIN_AREA).map((ring) => ring.map(round))
    )
}

// Resolves overlaps and self-crossings, which a scribble is full of.
const normalize = (shape: MultiPolygon) => (shape.length === 0 ? shape : union(shape))

const geometry = (shape: MultiPolygon) => ({ type: "MultiPolygon" as const, coordinates: shape })

// A dragged outline as clean, smoothed land, or null when it is too small or
// too tangled to be a shape. The ends are joined, crossings are resolved,
// the wobble is evened out, and the corners are cut into a soft curve.
export function lassoToShape(points: Pair[]): MultiPolygon | null {
  if (points.length < 6) return null
  try {
    const clean = normalize([[[...points, points[0]]]])
    const even = simplify(geometry(clean), { tolerance: TOLERANCE, highQuality: true })
    const smooth = polygonSmooth(even, { iterations: SMOOTHING })
    const pieces: MultiPolygon = smooth.features.flatMap((feature) =>
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as Ring[]]
        : (feature.geometry.coordinates as Ring[][])
    )
    const thin = simplify(geometry(normalize(pieces)), { tolerance: THINNING })
    const shape = tidy(normalize(thin.coordinates as MultiPolygon))
    return shape.length > 0 ? shape : null
  } catch {
    return null
  }
}

export function addLand(land: MultiPolygon, shape: MultiPolygon) {
  return tidy(land.length === 0 ? shape : union(land, shape))
}

// Bays, lakes and straits: what the shape covers stops being land.
export function cutLand(land: MultiPolygon, shape: MultiPolygon) {
  return land.length === 0 ? land : tidy(difference(land, shape))
}
