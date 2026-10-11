import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Group, Shape } from "react-konva"
import { traceLand } from "@/lib/map-land-trace"
import type { MapScene } from "@/lib/map-scene"
import { landmassAt, landmassesStamp } from "@/lib/stamps/stamp-save"
import type { LandmassStamp } from "@/lib/stamps/stamp-save"

const BLUE = "#2f6fed"

type Props = {
  enabled: boolean
  land: MultiPolygon
  canvas: MapScene["canvas"]
  // The landmasses picked so far, by the place of each in the land.
  selection: number[]
  onSelection: (selection: number[]) => void
  // What the picked landmasses make, kept up to date, or null while none is picked.
  onCandidate: (candidate: LandmassStamp | null) => void
}

// Development only: a click on a landmass picks it, and a click on it again lets it go, so
// that one island or a group of them can be kept as a stamp. What is picked shows in blue. It
// is the land as it is stored that is picked, with its corners as drawn, not as rounded.
export function MapLandmassPick({ enabled, land, canvas, selection, onSelection, onCandidate }: Props) {
  const layer = useRef<Konva.Group>(null)
  const latest = useRef({ land, selection, onSelection })
  useEffect(() => {
    latest.current = { land, selection, onSelection }
  })

  useEffect(() => {
    const stage = layer.current?.getStage()
    if (!enabled || !stage) return
    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0) return
      const { x, y } = stage.getRelativePointerPosition()!
      const { land, selection, onSelection } = latest.current
      const index = landmassAt(land, [x, y])
      if (index === null) return
      onSelection(selection.includes(index) ? selection.filter((other) => other !== index) : [...selection, index])
    }
    stage.on("pointerdown.pick", onDown)
    return () => {
      stage.off(".pick")
    }
  }, [enabled])

  useEffect(() => {
    onCandidate(enabled && selection.length > 0 ? landmassesStamp(land, selection, canvas) : null)
  }, [enabled, land, selection, canvas, onCandidate])

  return (
    <Group ref={layer} listening={false}>
      {enabled &&
        selection.map((index) =>
          land[index] ? (
            <Shape
              key={index}
              fill="rgba(47, 111, 237, 0.25)"
              fillRule="evenodd"
              stroke={BLUE}
              strokeWidth={2}
              strokeScaleEnabled={false}
              lineJoin="round"
              sceneFunc={(context, shape) => {
                traceLand(context, [land[index]])
                context.fillStrokeShape(shape)
              }}
            />
          ) : null
        )}
    </Group>
  )
}
