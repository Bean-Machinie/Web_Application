import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { Group } from "react-konva"
import type { PickedLandmass } from "@/hooks/use-stamp-placement"
import type { MapScene } from "@/lib/map-scene"
import { landmassStamp } from "@/lib/stamps/stamp-save"

type Props = {
  enabled: boolean
  land: MultiPolygon
  canvas: MapScene["canvas"]
  // The landmass that was clicked, or null if the click was on the sea.
  onPick: (picked: PickedLandmass | null) => void
}

// Development only: a click on a landmass picks it, to be kept as a stamp. It is the
// land as it is stored that is picked, with its corners as drawn, not as rounded.
export function MapLandmassPick({ enabled, land, canvas, onPick }: Props) {
  const layer = useRef<Konva.Group>(null)
  const latest = useRef({ land, canvas, onPick })
  useEffect(() => {
    latest.current = { land, canvas, onPick }
  })

  useEffect(() => {
    const stage = layer.current?.getStage()
    if (!enabled || !stage) return
    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0) return
      const { x, y } = stage.getRelativePointerPosition()!
      const { land, canvas, onPick } = latest.current
      onPick(landmassStamp(land, [x, y], canvas))
    }
    stage.on("pointerdown.pick", onDown)
    return () => {
      stage.off(".pick")
    }
  }, [enabled])

  return <Group ref={layer} listening={false} />
}
