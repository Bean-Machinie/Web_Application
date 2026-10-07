import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { drawOverview } from "@/lib/map-overview"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"

// How long after the last edit the overview is drawn again, so that painting
// and dragging do not draw it at every step.
const SETTLE_MS = 700

// Keeps a small picture of the whole map up to date: drawn at once when it is
// first shown, and a moment after the land, the paint or the art change.
export function useMapOverview(
  canvas: RefObject<HTMLCanvasElement | null>,
  scene: MapScene,
  terrain: Terrain | null
) {
  const drawn = useRef(false)
  const latest = useRef(scene)
  useEffect(() => {
    latest.current = scene
  })

  useEffect(() => {
    const target = canvas.current
    if (!target || !terrain) return
    const draw = () => drawOverview(target, latest.current, terrain)
    if (!drawn.current) {
      drawn.current = true
      draw()
      return
    }
    const timer = setTimeout(draw, SETTLE_MS)
    return () => clearTimeout(timer)
  }, [canvas, terrain, scene.land, scene.paint, scene.assets])
}
