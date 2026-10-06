import type { MultiPolygon, Pair, Ring } from "polygon-clipping"
import { onBorder } from "./map-land-clip"

type Size = { width: number; height: number }

// Corners are cut a few times over. A cut of a quarter of each edge is the
// classic smooth curve; less leaves corners sharper.
const PASSES = 3
const MAX_CUT = 0.25
// Below this nothing is visibly rounded, so the work is skipped.
const MIN_CUT = 0.002

const toward = ([x, y]: Pair, [tx, ty]: Pair, cut: number): Pair => [
  x + (tx - x) * cut,
  y + (ty - y) * cut,
]

function smoothRing(ring: Ring, cut: number, canvas: Size): Ring {
  let points = ring.slice(0, -1)
  for (let pass = 0; pass < PASSES; pass++) {
    const next: Pair[] = []
    points.forEach((point, index) => {
      // Where the land meets the canvas edge stays put, so the land keeps
      // reaching the edge and its corners there are not pulled away from it.
      if (onBorder(point, canvas)) return void next.push(point)
      const before = points[(index + points.length - 1) % points.length]
      const after = points[(index + 1) % points.length]
      next.push(toward(point, before, cut), toward(point, after, cut))
    })
    points = next
  }
  return [...points, points[0]]
}

// The land with its corners rounded, "roundness" from 0 to 1. The land as
// stored is never changed: this is only how it is drawn.
export function smoothLand(land: MultiPolygon, roundness: number, canvas: Size): MultiPolygon {
  const cut = roundness * MAX_CUT
  if (cut < MIN_CUT) return land
  return land.map((polygon) => polygon.map((ring) => smoothRing(ring, cut, canvas)))
}
