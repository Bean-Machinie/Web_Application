import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { css } from "@/lib/colour"
import type { DetailSurface } from "@/lib/details/detail-surface"
import { traceLand } from "@/lib/map-land-trace"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { themeFor } from "@/lib/map-theme"

type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  canvas: MapScene["canvas"]
  style: MapStyle
  details: Paint
  surface: DetailSurface
}

// The path and the road over the biomes, cut to the land's edge. It sits in the biomes'
// group, under the coast's ink line, so the brush redraws it with that layer. It is also
// what draws the details again when something that the river is drawn against changes:
// the land, or the coast's ink (see MapRiverLayer).
export function MapDetailLayer({ land, canvas, style, details, surface }: Props) {
  const shape = useRef<Konva.Shape>(null)
  const ink = css(themeFor(canvas.background).ink)

  // Paint the brush has been drawing is already on the picture.
  useEffect(() => {
    const changed = surface.setLook(land, ink, style.outline)
    if (!changed && surface.state.drawn === details) return
    surface.drawAll(details)
    shape.current?.getLayer()?.batchDraw()
  }, [surface, details, land, ink, style.outline])

  return (
    <Shape
      ref={shape}
      name="detail-paint"
      listening={false}
      sceneFunc={(context, node) => {
        if (land.length === 0 || !surface.state.touched) return
        // Publishing swaps in a sharper picture for the instant of drawing.
        const picture: HTMLCanvasElement = node.getAttr("picture") ?? surface.picture
        context.save()
        traceLand(context, land)
        context.clip("evenodd")
        context.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height)
        context.restore()
      }}
    />
  )
}
