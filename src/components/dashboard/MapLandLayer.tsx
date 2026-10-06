import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Shape } from "react-konva"
import { useTexture } from "@/hooks/use-texture"
import landGrain from "@/assets/textures/land-grain.png"
import { alongBorder } from "@/lib/map-land-clip"
import type { SceneBackground } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"

// The land, with an ink edge and a little shadow. What it looks like depends on
// what it sits on. These are art, so fixed colours.
const STYLES: Record<SceneBackground, { fill: string; ink: string }> = {
  parchment: { fill: "#efe3bd", ink: "#5b4128" },
  ocean: { fill: "#c6d193", ink: "#4a572d" },
}

// How strongly the paper grain shows on the land.
const GRAIN = 0.4

type Props = {
  // As it is shown, its corners already rounded.
  land: MultiPolygon
  background: SceneBackground
  style: MapStyle
  canvas: { width: number; height: number }
}

// All the land, in the scene's fixed place above the background.
export function MapLandLayer({ land: shown, background, style, canvas }: Props) {
  const colours = STYLES[background]
  const { width, height } = canvas
  const grain = useTexture(landGrain)

  // One path for all the polygons; the holes are rings of the same path.
  const traceFill = useCallback(
    (context: Konva.Context) => {
      context.beginPath()
      for (const polygon of shown) {
        for (const ring of polygon) {
          ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
          context.closePath()
        }
      }
    },
    [shown]
  )

  // The coast alone: where the land meets the edge of the canvas there is no
  // shore, so no line is drawn along it.
  const traceCoast = useCallback(
    (context: Konva.Context) => {
      context.beginPath()
      for (const polygon of shown) {
        for (const ring of polygon) {
          let drawing = false
          let cut = false
          for (let i = 1; i < ring.length; i++) {
            if (alongBorder(ring[i - 1], ring[i], { width, height })) {
              drawing = false
              cut = true
              continue
            }
            if (!drawing) context.moveTo(ring[i - 1][0], ring[i - 1][1])
            context.lineTo(ring[i][0], ring[i][1])
            drawing = true
          }
          if (!cut) context.closePath()
        }
      }
    },
    [shown, width, height]
  )

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
      {style.outline > 0 && (
        <Shape
          sceneFunc={(context, shape) => {
            traceCoast(context)
            context.strokeShape(shape)
          }}
          stroke={colours.ink}
          strokeWidth={style.outline}
          lineJoin="round"
        />
      )}
    </Layer>
  )
}
