import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { DetailSurface } from "@/lib/details/detail-surface"
import { traceLand } from "@/lib/map-land-trace"
import type { MapScene } from "@/lib/map-scene"

type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  canvas: MapScene["canvas"]
  details: Paint
  surface: DetailSurface
}

// The details over the biomes, cut to the land's edge. It sits in the biomes'
// group, under the coast's ink line, so the brush redraws it with that layer.
export function MapDetailLayer({ land, canvas, details, surface }: Props) {
  const shape = useRef<Konva.Shape>(null)

  // Paint the brush has been drawing is already on the picture.
  useEffect(() => {
    if (surface.state.drawn === details) return
    surface.drawAll(details)
    shape.current?.getLayer()?.batchDraw()
  }, [surface, details])

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
