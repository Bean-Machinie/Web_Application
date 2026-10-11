import type { MultiPolygon, Pair } from "polygon-clipping"

// Pinned points are points of the land's outline that the coast's rounding leaves as
// they are: the corners and the arcs of the shapes that were stamped with their own
// rounding. Land keeps its points to a hundredth of a pixel, so a point is found by
// its place in hundredths.
export const pinKey = ([x, y]: Pair) => `${Math.round(x * 100)},${Math.round(y * 100)}`

export const pinSet = (pinned: readonly Pair[]): ReadonlySet<string> => new Set(pinned.map(pinKey))

const round = ([x, y]: Pair): Pair => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]

// The pins that are still points of the coast: one that has been swallowed by land
// merged round it, or cut away, is dropped, so they do not pile up. Nothing is
// ever done to the coast's own points: this only keeps the list.
export function prunePins(pinned: readonly Pair[], land: MultiPolygon): Pair[] {
  if (pinned.length === 0) return []
  const coast = new Set<string>()
  for (const polygon of land) for (const ring of polygon) for (const point of ring) coast.add(pinKey(point))
  const seen = new Set<string>()
  const kept: Pair[] = []
  for (const point of pinned) {
    const key = pinKey(point)
    if (!coast.has(key) || seen.has(key)) continue
    seen.add(key)
    kept.push(round(point))
  }
  return kept
}

// What was saved, as far as it is good: points, and no more of them than a scene can hold.
const MOST = 200_000

export function readPins(saved: unknown): Pair[] {
  if (!Array.isArray(saved)) return []
  return saved
    .filter(
      (point): point is Pair =>
        Array.isArray(point) && point.length === 2 && point.every((value) => typeof value === "number" && Number.isFinite(value))
    )
    .slice(0, MOST)
}
