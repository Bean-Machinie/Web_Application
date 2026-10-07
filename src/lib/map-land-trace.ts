import type { MultiPolygon } from "polygon-clipping"

// Lays the land's outlines in the context's path: all the polygons as one path,
// the holes being rings of the same path.
export function traceLand(
  context: { beginPath(): void; moveTo(x: number, y: number): void; lineTo(x: number, y: number): void; closePath(): void },
  land: MultiPolygon
) {
  context.beginPath()
  for (const polygon of land) {
    for (const ring of polygon) {
      ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
      context.closePath()
    }
  }
}
