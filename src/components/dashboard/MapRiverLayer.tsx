import { Shape } from "react-konva"
import type { DetailSurface } from "@/lib/details/detail-surface"
import type { MapScene } from "@/lib/map-scene"

type Props = { canvas: MapScene["canvas"]; surface: DetailSurface }

// The river, over the coast's ink line, so that it covers it where it comes to the coast and the
// coast is open there, and not cut to the land, so that it can run on out into the sea. It is
// drawn already as water in the sea's own ground, with its banks on the land, and fades into
// the sea at its mouth (see river-render.ts). It is in the biomes' group, and the brush
// redraws it with that layer.
export function MapRiverLayer({ canvas, surface }: Props) {
  return (
    <Shape
      name="river-paint"
      listening={false}
      sceneFunc={(context, node) => {
        if (!surface.state.riverTouched) return
        // Publishing swaps in a sharper picture for the instant of drawing.
        const picture: HTMLCanvasElement = node.getAttr("picture") ?? surface.river
        context.drawImage(picture, 0, 0, picture.width, picture.height, 0, 0, canvas.width, canvas.height)
      }}
    />
  )
}
