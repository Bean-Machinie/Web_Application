import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
import { traceLand } from "@/lib/map-land-trace"
import type { SceneBackground } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"

// The painted land, with a little shadow. Its ink edge is drawn above
// the paint, in MapBiomeLayer.
type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  background: SceneBackground
  // The painted ground, and how many of its pixels go to a canvas pixel.
  texture: HTMLCanvasElement
  textureScale: number
}

// All the land, in the scene's fixed place above the background: nodes of the
// surfaces layer, drawn over the sea that was drawn before them.
export function MapLandLayer({ land: shown, background, texture, textureScale }: Props) {
  const { shadow } = themeFor(background).land

  const traceFill = useCallback((context: Konva.Context) => traceLand(context, shown), [shown])

  if (shown.length === 0) return null

  return (
    <Shape
        sceneFunc={(context, shape) => {
          traceFill(context)
          context.fillShape(shape)
        }}
        name="land-fill"
        // Konva takes any picture here, a canvas as well as an image element.
        fillPatternImage={texture as unknown as HTMLImageElement}
        fillPatternScale={{ x: 1 / textureScale, y: 1 / textureScale }}
        fillPatternRepeat="no-repeat"
        fillPriority="pattern"
        fillRule="evenodd"
        shadowColor={shadow.colour}
        shadowBlur={shadow.blur}
        shadowOffsetY={shadow.offsetY}
        shadowOpacity={shadow.opacity}
      />
  )
}
