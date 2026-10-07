import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Group, Shape } from "react-konva"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import { traceLand } from "@/lib/map-land-trace"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { MapCoastShape } from "./MapCoastShape"

type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  canvas: MapScene["canvas"]
  style: MapStyle
  paint: Paint
  surface: Surface
}

// The biomes over the land, cut to its edge, and the coast's ink line over
// them. The group is named so the brush can find the layer it is in, and redraw
// that, while painting.
export function MapBiomeLayer({ land, canvas, style, paint, surface }: Props) {
  const group = useRef<Konva.Group>(null)

  // Paint the brush has been drawing is already on the picture.
  useEffect(() => {
    if (surface.state.drawn === paint) return
    surface.drawAll(paint)
    group.current?.getLayer()?.batchDraw()
  }, [surface, paint])

  return (
    <Group ref={group} name="biomes" listening={false}>
      <Shape
        name="biome-paint"
        sceneFunc={(context, shape) => {
          if (land.length === 0 || !surface.state.touched) return
          // Publishing swaps in a sharper picture for the instant of drawing.
          const picture: HTMLCanvasElement = shape.getAttr("picture") ?? surface.picture
          context.save()
          traceLand(context, land)
          context.clip("evenodd")
          context.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height)
          context.restore()
        }}
      />
      <MapCoastShape
        land={land}
        canvas={canvas}
        background={canvas.background}
        outline={style.outline}
        surface={surface}
      />
    </Group>
  )
}
