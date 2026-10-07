import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Shape } from "react-konva"
import { useTexture } from "@/hooks/use-texture"
import landGrain from "@/assets/textures/land-grain.png"
import { css } from "@/lib/colour"
import { traceLand } from "@/lib/map-land-trace"
import type { SceneBackground } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"

// The land, with a little shadow and paper grain. Its ink edge is drawn above
// the paint, in MapBiomeLayer.
type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  background: SceneBackground
}

// All the land, in the scene's fixed place above the background.
export function MapLandLayer({ land: shown, background }: Props) {
  const { fill, grain: grainAmount, shadow } = themeFor(background).land
  const grain = useTexture(landGrain)

  const traceFill = useCallback((context: Konva.Context) => traceLand(context, shown), [shown])

  if (shown.length === 0) return <Layer listening={false} />

  return (
    <Layer listening={false}>
      <Shape
        sceneFunc={(context, shape) => {
          traceFill(context)
          context.fillShape(shape)
        }}
        fill={css(fill)}
        fillRule="evenodd"
        shadowColor={shadow.colour}
        shadowBlur={shadow.blur}
        shadowOffsetY={shadow.offsetY}
        shadowOpacity={shadow.opacity}
      />
      {grain && (
        <Shape
          sceneFunc={(context, shape) => {
            traceFill(context)
            context.fillShape(shape)
          }}
          fillPatternImage={grain}
          fillPatternRepeat="repeat"
          fillRule="evenodd"
          globalCompositeOperation="overlay"
          opacity={grainAmount}
        />
      )}
    </Layer>
  )
}
