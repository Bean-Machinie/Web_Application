import type Konva from "konva"
import type { Pair, Polygon } from "polygon-clipping"
import { css } from "../colour"
import { smoothLand } from "../map-coast-smooth"
import { traceLand } from "../map-land-trace"
import { pinSet } from "../map-pins"
import type { MapScene } from "../map-scene"
import type { MapStyle } from "../map-style"
import { themeFor } from "../map-theme"
import type { Terrain } from "../terrain"

type Look = {
  canvas: MapScene["canvas"]
  style: MapStyle
  terrain: Terrain
  // Whether the shape cuts land away instead of adding it.
  cutting: boolean
}

// A shape as it will look once applied: the corners rounded as the land's are, but for
// the pinned points of its own, filled
// with the land's ground when it adds and the sea's when it cuts, and the coast's line
// round it, all inside the canvas. The shore's water is left out: drawing that anew
// for every move of the pointer would be too much.
export function drawStampPreview(context: Konva.Context, outline: Polygon, pins: Pair[], { canvas, style, terrain, cutting }: Look) {
  const shown = smoothLand([outline], style.roundness, canvas, pinSet(pins))
  context.save()
  context.beginPath()
  context.rect(0, 0, canvas.width, canvas.height)
  context.clip()
  traceLand(context, shown)
  context.save()
  context.clip("evenodd")
  const ground = cutting ? terrain.sea : terrain.land
  context.drawImage(ground, 0, 0, ground.width, ground.height, 0, 0, canvas.width, canvas.height)
  context.restore()
  context.setAttr("strokeStyle", css(themeFor(canvas.background).ink))
  context.setAttr("lineWidth", style.outline)
  context.setAttr("lineJoin", "round")
  context.stroke()
  context.restore()
}
