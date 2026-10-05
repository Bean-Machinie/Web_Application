import { useEffect, useRef, useState } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { Layer, Line } from "react-konva"

// A point is only kept when the pointer has moved this far, in screen pixels.
const STEP = 3

type Props = {
  enabled: boolean
  // Whether what is drawn now cuts land away instead of adding it.
  cutting: boolean
  // "scale" is the zoom of the view the outline was drawn in.
  onLasso: (points: Pair[], cut: boolean, scale: number) => void
}

// The lasso: hold the pointer, scribble an outline, let go. The outline shows
// while it is drawn, over everything and left out of the rendered image. Mouse,
// pen and touch all work; the middle mouse button is left for panning.
export function MapLassoLayer({ enabled, cutting, onLasso }: Props) {
  const layer = useRef<Konva.Layer>(null)
  const [outline, setOutline] = useState<number[]>([])
  const latest = useRef({ cutting, onLasso })
  useEffect(() => {
    latest.current = { cutting, onLasso }
  })
  // Fixed when the stroke starts, so Alt pressed or let go midway changes nothing.
  const [cut, setCut] = useState(false)

  useEffect(() => {
    const stage = layer.current?.getStage()
    if (!enabled || !stage) return

    let points: Pair[] | null = null
    let strokeCuts = false
    const place = (event: PointerEvent): Pair => {
      stage.setPointersPositions(event)
      const { x, y } = stage.getRelativePointerPosition()!
      return [x, y]
    }

    const onMove = (event: PointerEvent) => {
      if (!points) return
      const next = place(event)
      const last = points[points.length - 1]
      const reach = STEP / stage.scaleX()
      if (Math.hypot(next[0] - last[0], next[1] - last[1]) < reach) return
      points.push(next)
      setOutline(points.flat())
    }
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      if (points && commit) latest.current.onLasso(points, strokeCuts, stage.scaleX())
      points = null
      setOutline([])
    }
    const onUp = () => end(true)
    const onCancel = () => end(false)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || points) return
      strokeCuts = latest.current.cutting
      setCut(strokeCuts)
      points = [place(event.evt)]
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }

    stage.on("pointerdown.lasso", onDown)
    return () => {
      stage.off("pointerdown.lasso")
      if (points) end(false)
    }
  }, [enabled])

  const color = cut ? "#ef4444" : "#ffffff"

  return (
    <Layer ref={layer} name="chrome" listening={false}>
      {outline.length >= 4 && (
        <>
          <Line
            points={outline}
            closed
            fill={cut ? "rgba(239, 68, 68, 0.18)" : "rgba(255, 255, 255, 0.22)"}
            stroke="rgba(0, 0, 0, 0.45)"
            strokeWidth={4}
            strokeScaleEnabled={false}
            lineJoin="round"
          />
          <Line
            points={outline}
            closed
            stroke={color}
            strokeWidth={2}
            strokeScaleEnabled={false}
            lineJoin="round"
          />
        </>
      )}
    </Layer>
  )
}
