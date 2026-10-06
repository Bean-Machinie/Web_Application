import { intersection } from "polygon-clipping"
import type { MultiPolygon, Pair } from "polygon-clipping"

type Size = { width: number; height: number }

// How near the edge of the canvas counts as on it, in canvas pixels. Clipped
// land is kept to a hundredth of a pixel, so its edge points are exact.
const EDGE = 0.01

const round = ([x, y]: Pair): Pair => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]

// Land is never stored outside the canvas: whatever lies past the edge is cut
// off, so nothing outside is merged, saved or rendered. Throws, as the clipping
// does, on a shape it cannot handle.
export function clipToCanvas(shape: MultiPolygon, { width, height }: Size): MultiPolygon {
  if (shape.length === 0) return shape
  const canvas: Pair[] = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]]
  return intersection(shape, [canvas]).map((polygon) => polygon.map((ring) => ring.map(round)))
}

export function onBorder([x, y]: Pair, { width, height }: Size) {
  return x <= EDGE || y <= EDGE || x >= width - EDGE || y >= height - EDGE
}

// Whether a straight edge runs along one side of the canvas.
export function alongBorder(a: Pair, b: Pair, { width, height }: Size) {
  return (
    (a[0] <= EDGE && b[0] <= EDGE) ||
    (a[0] >= width - EDGE && b[0] >= width - EDGE) ||
    (a[1] <= EDGE && b[1] <= EDGE) ||
    (a[1] >= height - EDGE && b[1] >= height - EDGE)
  )
}
