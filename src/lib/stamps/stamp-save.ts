import simplify from "@turf/simplify"
import type { MultiPolygon, Pair, Polygon, Ring } from "polygon-clipping"
import { onBorder } from "../map-land-clip"
import type { SavedStamp } from "./stamps"

type Size = { width: number; height: number }

// How much of the outline is ironed out, as a share of the landmass's longer side.
const TOLERANCE = 0.002
// Holes smaller than this share of the landmass are left out.
const LEAST_HOLE = 0.0004

function inRing([x, y]: Pair, ring: Ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const boxOf = (ring: Ring) => {
  const xs = ring.map(([x]) => x)
  const ys = ring.map(([, y]) => y)
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

// The landmass at a point of the canvas, made ready to be kept as a stamp: its
// outline simplified, and fitted to a box of 0 to 1 each way, with how wide it was
// for its height. "touchesEdge" says its outline runs along the map's edge, where
// it was cut straight. Null where there is no land.
export function landmassStamp(
  land: MultiPolygon,
  point: Pair,
  canvas: Size
): (Omit<SavedStamp, "id" | "name"> & { touchesEdge: boolean }) | null {
  const polygon = land.find(([outer, ...holes]) => inRing(point, outer) && !holes.some((hole) => inRing(point, hole)))
  if (!polygon) return null
  const box = boxOf(polygon[0])
  if (box.width <= 0 || box.height <= 0) return null

  const touchesEdge = polygon[0].some((corner) => onBorder(corner, canvas))
  const longer = Math.max(box.width, box.height)
  const kept: Polygon = polygon.filter((ring, index) => {
    if (index === 0) return true
    const hole = boxOf(ring)
    return (hole.width * hole.height) / (box.width * box.height) >= LEAST_HOLE
  })
  const even = simplify({ type: "Polygon", coordinates: kept }, { tolerance: longer * TOLERANCE, highQuality: true })
  const unit = (even.coordinates as Polygon)
    .filter((ring) => ring.length >= 4)
    .map((ring): Ring =>
      ring.map(([x, y]) => [Math.round(((x - box.x) / box.width) * 1e4) / 1e4, Math.round(((y - box.y) / box.height) * 1e4) / 1e4])
    )
  return unit.length === 0 ? null : { aspect: Math.round((box.width / box.height) * 1e4) / 1e4, rings: unit, touchesEdge }
}
