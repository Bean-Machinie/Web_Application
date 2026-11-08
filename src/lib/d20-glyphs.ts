// A point of a stroke: where it is, and how thick the stroke is there, as a share of BASE_HALF.
type Point = readonly [number, number, number]

// A digit is 1 wide and this high, y going down; digits of a number sit this far apart, start to start.
export const GLYPH_HEIGHT = 1.6
export const GLYPH_ADVANCE = 1.3
// Half the width of a stroke of weight 1, in digit units.
const BASE_HALF = 0.1
// Strokes are thick going up and down and hairline going across, as in a classic serif face.
const THICK = 1.5
const THIN = 0.6

const T = Math.PI

// Points along an ellipse's arc, from one angle to another (y down, so negative angles are above), thick
// on its sides and thin at its top and bottom.
const arc = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 24): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a), THIN + (THICK - THIN) * Math.abs(Math.cos(a))]
  })

// Points along a curve from one point to another, bent toward a control point, its weight easing from
// the first point's to the last's.
const curve = (a: Point, q: readonly [number, number], b: Point, steps = 16): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const [u, v, w] = [(1 - t) * (1 - t), 2 * t * (1 - t), t * t]
    return [u * a[0] + v * q[0] + w * b[0], u * a[1] + v * q[1] + w * b[1], a[2] + (b[2] - a[2]) * t]
  })

// A straight stroke of one weight through the given points.
const line = (weight: number, ...points: [number, number][]): Point[] => points.map(([x, y]) => [x, y, weight])

const SIX: Point[][] = [arc(0.52, 1.1, 0.4, 0.45, 0, 2 * T, 32), arc(0.58, 1.02, 0.46, 0.96, T, T + 2.15, 18)]
const turnedOver = (lines: Point[][]) => lines.map((stroke) => stroke.map(([x, y, w]): Point => [1 - x, GLYPH_HEIGHT - y, w]))

// The digits in a classic serif style: tall ovals and bowls swelling on their sides, thick stems and
// diagonals, hairline bars and flags, and a small serif at the foot of the 4.
const GLYPHS: Point[][][] = [
  [arc(0.5, 0.8, 0.4, 0.75, 0, 2 * T, 40)],
  [line(THICK, [0.56, 0.06], [0.56, 1.55]), line(THIN, [0.56, 0.06], [0.28, 0.26])],
  [[...arc(0.5, 0.46, 0.4, 0.41, T + 0.3, 2 * T + 0.35), ...curve([0.87, 0.6, 1.2], [0.6, 1.0], [0.1, 1.55, 1.2])], line(THIN + 0.3, [0.1, 1.55], [0.92, 1.55])],
  [[...arc(0.5, 0.42, 0.37, 0.37, T + 0.45, 2 * T + 1.2), [0.44, 0.76, THIN]], arc(0.5, 1.15, 0.42, 0.41, -T / 2 - 0.2, T - 0.5)],
  [line(THIN, [0.68, 0.06], [0.06, 1.1]), line(THICK, [0.68, 0.06], [0.68, 1.55]), line(THIN, [0.06, 1.1], [0.94, 1.1]), line(THIN, [0.46, 1.55], [0.9, 1.55])],
  [line(THIN + 0.2, [0.86, 0.06], [0.24, 0.06]), line(THICK - 0.3, [0.24, 0.06], [0.18, 0.74]), arc(0.52, 1.08, 0.42, 0.47, T + 1.1, 3 * T - 0.5)],
  SIX,
  [line(THIN, [0.06, 0.06], [0.94, 0.06]), curve([0.94, 0.06, THIN], [0.56, 0.62], [0.42, 1.55, THICK])],
  [arc(0.5, 0.42, 0.34, 0.36, 0, 2 * T, 32), arc(0.5, 1.16, 0.42, 0.4, 0, 2 * T, 32)],
  turnedOver(SIX),
]

// How far inside a stroke a point is (negative outside), for a segment whose thickness eases along it.
function depthInSegment([px, py]: readonly [number, number], [ax, ay, aw]: Point, [bx, by, bw]: Point) {
  const [dx, dy] = [bx - ax, by - ay]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)))
  return (aw + (bw - aw) * t) * BASE_HALF - Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

// How far inside the nearest stroke a point is (negative outside it), for a number laid out from 0,0
// (its first digit's top left), in digit units.
export function strokeDepth(value: number, x: number, y: number) {
  let best = -Infinity
  ;[...String(value)].forEach((char, index) => {
    const local = [x - index * GLYPH_ADVANCE, y] as const
    if (local[0] < -0.5 || local[0] > 1.5 || y < -0.5 || y > GLYPH_HEIGHT + 0.5) return
    for (const stroke of GLYPHS[Number(char)]) {
      for (let k = 1; k < stroke.length; k++) best = Math.max(best, depthInSegment(local, stroke[k - 1], stroke[k]))
    }
  })
  return best
}

// How wide a number is, from its first digit's left to its last digit's right.
export const numberWidth = (value: number) => String(value).length * GLYPH_ADVANCE - (GLYPH_ADVANCE - 1)
