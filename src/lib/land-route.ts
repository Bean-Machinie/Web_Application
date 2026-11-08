import { GRID } from "./land-grid"
import type { LandGrid } from "./land-grid"
import { landPath } from "./land-path"

// A place on the picture, as fractions of its width and height.
export type RoutePoint = [number, number]

const PICKS = 40
// Too little land for a route worth drawing.
const LEAST_LAND = 20
// Every how many cells of the path a point is kept before smoothing.
const EVERY = 4
// How much of the found path is left off at its start and end, so it runs between places inland
// rather than from coast to coast, as shares of its length.
const TRIM_START = 0.1
const TRIM_END = 0.15
// How far the route swings to either side of the found path, as a share of the picture, and how
// quickly from point to point, so it meanders as a drawn trail does.
const SWIRL = 0.045
const SWIRL_RATE = 1.6
// How many cells in from the water the swings keep, so the line stays on land.
const ON_LAND = 2

// The same numbers for the same seed (mulberry32), so a picture always gets the same route.
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedOf(text: string) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return hash >>> 0
}

// The cells of the largest stretch of joined land.
function largestLand(land: Uint8Array) {
  const seen = new Uint8Array(land.length)
  let best: number[] = []
  for (let first = 0; first < land.length; first++) {
    if (!land[first] || seen[first]) continue
    const cells = [first]
    seen[first] = 1
    for (let k = 0; k < cells.length; k++) {
      const [x, y] = [cells[k] % GRID, Math.floor(cells[k] / GRID)]
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const n = ny * GRID + nx
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || !land[n] || seen[n]) continue
        seen[n] = 1
        cells.push(n)
      }
    }
    if (cells.length > best.length) best = cells
  }
  return best
}

// Of a few seeded picks of the land, the two furthest apart.
function endsOf(cells: number[], random: () => number): [number, number] {
  const picks = Array.from({ length: PICKS }, () => cells[Math.floor(random() * cells.length)])
  let ends: [number, number] = [picks[0], picks[1]]
  let far = -1
  for (const a of picks) {
    for (const b of picks) {
      const d = Math.hypot((a % GRID) - (b % GRID), Math.floor(a / GRID) - Math.floor(b / GRID))
      if (d > far) [far, ends] = [d, [a, b]]
    }
  }
  return ends
}

// A meandering route over the land of a map picture between two far apart places, the same each time
// for the same seed; null when there is too little land.
export function landRoute(grid: LandGrid, seed: number): RoutePoint[] | null {
  const cells = largestLand(grid.land)
  if (cells.length < LEAST_LAND) return null
  const path = landPath(grid, ...endsOf(cells, seeded(seed)))
  if (!path || path.length < 2) return null
  const trimmed = path.slice(Math.floor(path.length * TRIM_START), Math.ceil(path.length * (1 - TRIM_END)))
  if (trimmed.length < 2) return null
  const kept = trimmed.filter((_, i) => i % EVERY === 0 || i === trimmed.length - 1)
  return swirl(grid, kept.map((cell) => [((cell % GRID) + 0.5) / GRID, (Math.floor(cell / GRID) + 0.5) / GRID]))
}

// Whether a place is on land, at least `depth` cells in from the water.
function inland({ land, shore }: LandGrid, [x, y]: RoutePoint, depth: number) {
  const [cx, cy] = [Math.floor(x * GRID), Math.floor(y * GRID)]
  if (cx < 0 || cy < 0 || cx >= GRID || cy >= GRID) return false
  const cell = cy * GRID + cx
  return land[cell] === 1 && shore[cell] >= depth
}

// A step from a place, cut shorter as far as needed to stay on land (no step at all, if it must be).
function toward(grid: LandGrid, [x, y]: RoutePoint, [dx, dy]: RoutePoint): RoutePoint {
  for (const share of [1, 0.66, 0.33]) {
    const next: RoutePoint = [x + dx * share, y + dy * share]
    if (inland(grid, next, ON_LAND)) return next
  }
  return [x, y]
}

// Pushes each point to one side or the other of the way the route runs there, in a wave that dies away
// at both ends, so the route keeps its start and end; never so far that it leaves the land.
function swirl(grid: LandGrid, points: RoutePoint[]): RoutePoint[] {
  return points.map(([x, y], i) => {
    const [ax, ay] = points[Math.max(0, i - 1)]
    const [bx, by] = points[Math.min(points.length - 1, i + 1)]
    const along = Math.hypot(bx - ax, by - ay) || 1
    const swing = SWIRL * Math.sin(i * SWIRL_RATE) * Math.sin((Math.PI * i) / (points.length - 1))
    return toward(grid, [x, y], [-((by - ay) / along) * swing, ((bx - ax) / along) * swing])
  })
}

// The route as a smooth SVG path (Catmull-Rom, as cubic curves) through its points, in a box of the given size.
export function smoothRoute(points: RoutePoint[], width: number, height: number) {
  const p = points.map(([x, y]) => [x * width, y * height])
  let d = `M${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(p.length - 1, i + 2)]]
    d += ` C${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6}, ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6}, ${c[0]} ${c[1]}`
  }
  return d
}
