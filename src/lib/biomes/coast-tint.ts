import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { alongBorder } from "../map-land-clip"
import { css } from "../colour"
import type { Rgb } from "../colour"

// The coast is stroked in pieces no longer than this, each in the colour of the
// ground beside it, so the ink changes smoothly where biomes meet.
const PIECE = 8

// Strokes the coast of the land, in the colour "inkAt" gives for each place
// (where it is, and which way the coast faces there, as a unit vector),
// all into the context of one shape. Where the land meets the edge of the
// canvas there is no shore, so no line is drawn.
export function strokeCoast(
  context: Konva.Context,
  land: MultiPolygon,
  canvas: { width: number; height: number },
  inkAt: (x: number, y: number, nx: number, ny: number) => Rgb
) {
  let colour = ""
  let reach: [number, number] | null = null
  const flush = () => {
    if (reach) context.stroke()
    reach = null
  }

  for (const polygon of land) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const [ax, ay] = ring[i - 1]
        const [bx, by] = ring[i]
        if (alongBorder(ring[i - 1], ring[i], canvas)) {
          flush()
          continue
        }
        const length = Math.hypot(bx - ax, by - ay)
        const pieces = Math.max(Math.ceil(length / PIECE), 1)
        const nx = length > 0 ? -(by - ay) / length : 0
        const ny = length > 0 ? (bx - ax) / length : 0
        for (let p = 0; p < pieces; p++) {
          const x0 = ax + ((bx - ax) * p) / pieces
          const y0 = ay + ((by - ay) * p) / pieces
          const x1 = ax + ((bx - ax) * (p + 1)) / pieces
          const y1 = ay + ((by - ay) * (p + 1)) / pieces
          const next = css(inkAt((x0 + x1) / 2, (y0 + y1) / 2, nx, ny))
          const joined = reach !== null && reach[0] === x0 && reach[1] === y0
          if (!joined || next !== colour) {
            flush()
            colour = next
            context.setAttr("strokeStyle", colour)
            context.beginPath()
            context.moveTo(x0, y0)
          }
          context.lineTo(x1, y1)
          reach = [x1, y1]
        }
      }
      flush()
    }
  }
}
