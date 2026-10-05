import { useCallback } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Layer, Shape } from "react-konva"
import type { SceneBackground } from "@/lib/map-scene"

// The coast: soft bands of shallows that fade away from the shore, then the
// land with an ink edge and a little shadow. What the shallows and the land
// look like depends on what they sit on. These are art, so fixed colours.
const STYLES: Record<
  SceneBackground,
  { shallows: string; fill: string; ink: string }
> = {
  parchment: { shallows: "120, 86, 48", fill: "#efe3bd", ink: "#5b4128" },
  ocean: { shallows: "196, 238, 242", fill: "#c6d193", ink: "#4a572d" },
}

// Wide to narrow, each a stroke centred on the shore; the land covers the half
// that falls inland.
const BANDS = [
  { width: 110, alpha: 0.07 },
  { width: 68, alpha: 0.1 },
  { width: 34, alpha: 0.16 },
]

type Props = { land: MultiPolygon; background: SceneBackground }

// All the land, in the scene's fixed place above the background.
export function MapLandLayer({ land, background }: Props) {
  const style = STYLES[background]

  // One path for all the polygons; the holes are rings of the same path.
  const trace = useCallback(
    (context: Konva.Context) => {
      context.beginPath()
      for (const polygon of land) {
        for (const ring of polygon) {
          ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
          context.closePath()
        }
      }
    },
    [land]
  )

  if (land.length === 0) return <Layer listening={false} />

  return (
    <Layer listening={false}>
      {BANDS.map(({ width, alpha }) => (
        <Shape
          key={width}
          sceneFunc={(context, shape) => {
            trace(context)
            context.fillStrokeShape(shape)
          }}
          fillEnabled={false}
          stroke={`rgba(${style.shallows}, ${alpha})`}
          strokeWidth={width}
          lineJoin="round"
        />
      ))}
      <Shape
        sceneFunc={(context, shape) => {
          trace(context)
          context.fillStrokeShape(shape)
        }}
        fill={style.fill}
        fillRule="evenodd"
        stroke={style.ink}
        strokeWidth={3}
        lineJoin="round"
        shadowColor="#000"
        shadowBlur={16}
        shadowOffsetY={5}
        shadowOpacity={0.3}
        shadowForStrokeEnabled={false}
      />
    </Layer>
  )
}
