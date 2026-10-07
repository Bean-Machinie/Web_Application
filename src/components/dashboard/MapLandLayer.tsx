import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Shape } from "react-konva"
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
  // The painted ground, where there is a tile for it, and how many of its pixels
  // go to a canvas pixel; without one the land is its colour and grain.
  texture: HTMLCanvasElement | null
  textureScale: number
}

// All the land, in the scene's fixed place above the background: nodes of the
// surfaces layer, drawn over the sea that was drawn before them.
export function MapLandLayer({ land: shown, background, texture, textureScale }: Props) {
  const { fill, grain: grainAmount, shadow } = themeFor(background).land
  const grain = useTexture(landGrain)

  const traceFill = useCallback((context: Konva.Context) => traceLand(context, shown), [shown])

  if (shown.length === 0) return null

  return (
    <>
      <Shape
        sceneFunc={(context, shape) => {
          traceFill(context)
          context.fillShape(shape)
        }}
        name="land-fill"
        fill={texture ? undefined : css(fill)}
        // Konva takes any picture here, a canvas as well as an image element.
        fillPatternImage={(texture ?? undefined) as unknown as HTMLImageElement | undefined}
        fillPatternScale={{ x: 1 / textureScale, y: 1 / textureScale }}
        fillPatternRepeat="no-repeat"
        fillPriority={texture ? "pattern" : "color"}
        fillRule="evenodd"
        shadowColor={shadow.colour}
        shadowBlur={shadow.blur}
        shadowOffsetY={shadow.offsetY}
        shadowOpacity={shadow.opacity}
      />
      {grain && !texture && (
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
    </>
  )
}
