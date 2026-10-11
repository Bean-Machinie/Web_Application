import simplify from "@turf/simplify"
import type { MultiPolygon, Pair, Polygon, Ring } from "polygon-clipping"
import { onBorder } from "../map-land-clip"

type Size = { width: number; height: number }

// How much of the outline is ironed out, as a share of the longer side of what is kept.
const TOLERANCE = 0.002
// Holes smaller than this share of what is kept are left out.
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

const boxOf = (rings: Ring[]) => {
  const points = rings.flat()
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

// Which landmass of the land is at a point of the canvas: the index of its polygon, or null
// on the sea, or in a lake of one.
export function landmassAt(land: MultiPolygon, point: Pair): number | null {
  const index = land.findIndex(([outer, ...holes]) => inRing(point, outer) && !holes.some((hole) => inRing(point, hole)))
  return index < 0 ? null : index
}

export type LandmassStamp = {
  aspect: number
  polygons: Polygon[]
  // How many landmasses are in it.
  count: number
  // Its outline runs along the map's edge, where it was cut straight.
  touchesEdge: boolean
}

// The landmasses at these places of the land (one or a group of islands), made ready to be
// kept as one stamp: each outline simplified, and all fitted to one box of 0 to 1 each way,
// with how wide it was for its height, so that they keep their places to one another. Null
// if nothing is left of them.
export function landmassesStamp(land: MultiPolygon, picked: number[], canvas: Size): LandmassStamp | null {
  const polygons = [...new Set(picked)].flatMap((index) => (land[index] ? [land[index]] : []))
  if (polygons.length === 0) return null
  const outers = polygons.map(([outer]) => outer)
  const box = boxOf(outers)
  if (box.width <= 0 || box.height <= 0) return null

  const touchesEdge = outers.some((outer) => outer.some((corner) => onBorder(corner, canvas)))
  const longer = Math.max(box.width, box.height)
  const unit = (ring: Ring): Ring =>
    ring.map(([x, y]) => [Math.round(((x - box.x) / box.width) * 1e4) / 1e4, Math.round(((y - box.y) / box.height) * 1e4) / 1e4])

  const kept: Polygon[] = []
  for (const polygon of polygons) {
    const rings = polygon.filter((ring, index) => {
      if (index === 0) return true
      const hole = boxOf([ring])
      return (hole.width * hole.height) / (box.width * box.height) >= LEAST_HOLE
    })
    const even = simplify({ type: "Polygon", coordinates: rings }, { tolerance: longer * TOLERANCE, highQuality: true })
    const simple = even.coordinates as Polygon
    // A landmass that is nothing once simplified, its outer ring gone, is left out.
    if (simple[0].length < 4) continue
    kept.push(simple.filter((ring) => ring.length >= 4).map(unit))
  }
  if (kept.length === 0) return null
  return { aspect: Math.round((box.width / box.height) * 1e4) / 1e4, polygons: kept, count: kept.length, touchesEdge }
}
