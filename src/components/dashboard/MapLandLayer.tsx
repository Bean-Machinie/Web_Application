import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Shape } from "react-konva"
import { useTexture } from "@/hooks/use-texture"
import landGrain from "@/assets/textures/land-grain.png"
import { LAND_COLOURS } from "@/lib/map-land-colours"
import { traceLand } from "@/lib/map-land-trace"
import type { SceneBackground } from "@/lib/map-scene"

// The land, with a little shadow and paper grain. Its ink edge is drawn above
// the paint, in MapBiomeLayer.
// How strongly the paper grain shows on the land.
const GRAIN = 0.4

type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  background: SceneBackground
}

// All the land, in the scene's fixed place above the background.
export function MapLandLayer({ land: shown, background }: Props) {
  const colours = LAND_COLOURS[background]
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
        fill={colours.fill}
        fillRule="evenodd"
        shadowColor="#000"
        shadowBlur={16}
        shadowOffsetY={5}
        shadowOpacity={0.3}
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
          opacity={GRAIN}
        />
      )}
    </Layer>
  )
}
