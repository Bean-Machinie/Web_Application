import type { MultiPolygon, Pair, Ring } from "polygon-clipping"
import type { Stamp } from "./stamps"

// How a stamp with corners is rounded: whether it is, and by how much, as a share of the
// most each corner can take, from 0 (sharp) to 1 (the curves of neighbouring corners meet).
// It is a share and not a length, so a shape looks the same at any size.
export type Rounding = { on: boolean; amount: number }

export const CORNER_ROUNDING = { min: 0, max: 1, step: 0.01, start: 0.2 }

// An arc has a point about this many canvas pixels along it, with at least a few.
const ARC_STEP = 2.5
const FEWEST_ARC_POINTS = 4

const minus = (a: Pair, b: Pair): Pair => [a[0] - b[0], a[1] - b[1]]
const length = ([x, y]: Pair) => Math.hypot(x, y)

// A closed ring with each of its corners cut to an arc. Each corner can take at most half
// of each edge it is on, so that two corners never overlap, and that is the most it is
// rounded: "amount" is the share of it that is, so the radius of a corner is that share
// of the largest it could be, from the lengths of its own two edges.
export function roundRing(ring: Ring, amount: number): Ring {
  const corners = ring.slice(0, -1)
  const out: Pair[] = []
  corners.forEach((corner, i) => {
    const before = corners[(i + corners.length - 1) % corners.length]
    const after = corners[(i + 1) % corners.length]
    const toBefore = minus(before, corner)
    const toAfter = minus(after, corner)
    const lengthBefore = length(toBefore)
    const lengthAfter = length(toAfter)
    if (lengthBefore === 0 || lengthAfter === 0) return void out.push(corner)
    const a: Pair = [toBefore[0] / lengthBefore, toBefore[1] / lengthBefore]
    const b: Pair = [toAfter[0] / lengthAfter, toAfter[1] / lengthAfter]
    // The angle between the edges: a straight line has nothing to round.
    const angle = Math.acos(Math.min(Math.max(a[0] * b[0] + a[1] * b[1], -1), 1))
    if (angle > Math.PI - 1e-3 || angle < 1e-3) return void out.push(corner)
    const tangent = amount * (Math.min(lengthBefore, lengthAfter) / 2)
    if (tangent < 1e-6) return void out.push(corner)
    const exact = tangent * Math.tan(angle / 2)
    const start: Pair = [corner[0] + a[0] * tangent, corner[1] + a[1] * tangent]
    const end: Pair = [corner[0] + b[0] * tangent, corner[1] + b[1] * tangent]
    // The arc's middle lies along the line that halves the corner.
    const half: Pair = [a[0] + b[0], a[1] + b[1]]
    const away = exact / Math.sin(angle / 2) / length(half)
    const centre: Pair = [corner[0] + half[0] * away, corner[1] + half[1] * away]
    const from = Math.atan2(start[1] - centre[1], start[0] - centre[0])
    let sweep = Math.atan2(end[1] - centre[1], end[0] - centre[0]) - from
    // The short way round.
    if (sweep > Math.PI) sweep -= Math.PI * 2
    if (sweep < -Math.PI) sweep += Math.PI * 2
    const count = Math.max(Math.ceil((exact * Math.abs(sweep)) / ARC_STEP), FEWEST_ARC_POINTS)
    for (let step = 0; step <= count; step++) {
      const turn = from + (sweep * step) / count
      out.push([centre[0] + Math.cos(turn) * exact, centre[1] + Math.sin(turn) * exact])
    }
  })
  return [...out, out[0]]
}

// The outline of a stamp as it is applied, and the points of it that are pinned. A
// stamp with corners keeps its corners, sharp, or rounded by the chosen share, whatever the
// coast's rounding does to the rest of the land: every point of its outline is pinned.
// A stamp without corners (a circle, an island) has none pinned, and is rounded as the
// land is.
export function shapeOutline(stamp: Stamp, outline: MultiPolygon, rounding: Rounding): { outline: MultiPolygon; pins: Pair[] } {
  if (!stamp.corners) return { outline, pins: [] }
  const shaped = rounding.on ? outline.map((polygon) => polygon.map((ring) => roundRing(ring, rounding.amount))) : outline
  return { outline: shaped, pins: shaped.flatMap((polygon) => polygon.flatMap((ring) => ring.slice(0, -1))) }
}
