type Point = readonly [number, number]

// A digit is 1 wide and this high, y going down; digits of a number sit this far apart, start to start.
export const GLYPH_HEIGHT = 1.6
export const GLYPH_ADVANCE = 1.35

const T = Math.PI

// Points along an ellipse's arc, from one angle to another (y down, so negative angles are above).
const arc = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 20): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]
  })

// Points along a curve from one point to another, bent toward a control point.
const curve = ([ax, ay]: Point, [qx, qy]: Point, [bx, by]: Point, steps = 16): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const [u, v, w] = [(1 - t) * (1 - t), 2 * t * (1 - t), t * t]
    return [u * ax + v * qx + w * bx, u * ay + v * qy + w * by]
  })

// A round bowl at the bottom and a stem sweeping up from its left side to a short hook at the top right.
const SIX: Point[][] = [arc(0.52, 1.1, 0.4, 0.45, 0, 2 * T, 32), arc(0.56, 1.0, 0.44, 0.94, T, T + 2.2, 18)]
const turnedOver = (lines: Point[][]) => lines.map((line) => line.map(([x, y]): Point => [1 - x, GLYPH_HEIGHT - y]))

// The digits as thin strokes in plain grotesque shapes, like Arial's: tall ovals, straight stems and
// bars, flat feet and smooth joins.
const GLYPHS: Point[][][] = [
  [arc(0.5, 0.8, 0.4, 0.75, 0, 2 * T, 36)],
  [[[0.28, 0.32], [0.6, 0.05], [0.6, 1.55]]],
  [[...arc(0.5, 0.46, 0.4, 0.41, T + 0.3, 2 * T + 0.35), ...curve([0.87, 0.6], [0.62, 1.02], [0.08, 1.55]), [0.92, 1.55]]],
  [[...arc(0.5, 0.42, 0.37, 0.37, T + 0.45, 2 * T + 1.2), [0.42, 0.76]], arc(0.5, 1.15, 0.42, 0.41, -T / 2 - 0.2, T - 0.5, 20)],
  [[[0.7, 1.55], [0.7, 0.05], [0.05, 1.1], [0.95, 1.1]]],
  [[[0.86, 0.05], [0.22, 0.05], [0.15, 0.78], ...arc(0.52, 1.08, 0.42, 0.47, T + 1.1, 3 * T - 0.5, 22)]],
  SIX,
  [[[0.06, 0.05], [0.94, 0.05], ...curve([0.94, 0.05], [0.56, 0.62], [0.4, 1.55])]],
  [arc(0.5, 0.42, 0.35, 0.36, 0, 2 * T, 28), arc(0.5, 1.16, 0.42, 0.4, 0, 2 * T, 28)],
  turnedOver(SIX),
]

function toSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point) {
  const [dx, dy] = [bx - ax, by - ay]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

// How far a point is from the nearest stroke of a number laid out from 0,0 (its first digit's top left).
export function strokeDistance(value: number, x: number, y: number) {
  let best = Infinity
  ;[...String(value)].forEach((char, index) => {
    const local: Point = [x - index * GLYPH_ADVANCE, y]
    if (local[0] < -0.5 || local[0] > 1.5 || y < -0.5 || y > GLYPH_HEIGHT + 0.5) return
    for (const line of GLYPHS[Number(char)]) {
      for (let k = 1; k < line.length; k++) best = Math.min(best, toSegment(local, line[k - 1], line[k]))
    }
  })
  return best
}

// How wide a number is, from its first digit's left to its last digit's right.
export const numberWidth = (value: number) => String(value).length * GLYPH_ADVANCE - (GLYPH_ADVANCE - 1)
