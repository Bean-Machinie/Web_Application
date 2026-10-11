import { useEffect, useRef } from "react"
import type Konva from "konva"
import { Circle, Group } from "react-konva"
import type { Brush } from "@/hooks/use-brush"
import { isResizeGesture, resizing } from "@/lib/brush-resize"

// How often, at the most, the brush's size is given to the rest of the builder while it is
// dragged, in milliseconds. The ring does not wait: it is drawn at every move of the
// pointer, and the size in the panel catches up, and is exact when the pointer is let go.
const SIZE_EVERY_MS = 90

// Resizing the brush, for every brush: hold Ctrl and Alt, press, and drag. The ring stays
// where it is, and the pointer, which is the ordinary arrow while this goes on, is on its
// edge, so that dragging out and in sets the radius, and the ring follows at once, to
// the pixel. The ring is the editor's only, as a group of the editor layer; it is drawn
// by hand and not through React, so that dragging does not wait on the whole builder.
export function MapBrushResize({ enabled, brush }: { enabled: boolean; brush: Brush }) {
  const layer = useRef<Konva.Group>(null)
  const ring = useRef<Konva.Group>(null)
  const latest = useRef(brush)
  useEffect(() => {
    latest.current = brush
  })

  useEffect(() => {
    const stage = layer.current?.getStage()
    const shown = ring.current
    if (!enabled || !stage || !shown) return
    const container = stage.container()
    let centre: { x: number; y: number } | null = null
    let diameter = 0
    let lastSent = 0
    let waiting: number | undefined

    const place = (event: PointerEvent) => {
      stage.setPointersPositions(event)
      return stage.getRelativePointerPosition()!
    }
    const draw = () => {
      shown.find<Konva.Circle>("Circle").forEach((circle) => circle.radius(diameter / 2))
      shown.getLayer()?.batchDraw()
    }
    const send = () => {
      window.clearTimeout(waiting)
      waiting = undefined
      lastSent = performance.now()
      latest.current.onSize(Math.round(diameter))
    }
    const onMove = (event: PointerEvent) => {
      if (!centre) return
      const { range } = latest.current
      // Every position the pointer passed through, where the browser reports them.
      for (const each of event.getCoalescedEvents?.().length ? event.getCoalescedEvents() : [event]) {
        const at = place(each)
        diameter = Math.min(Math.max(Math.hypot(at.x - centre.x, at.y - centre.y) * 2, range.min), range.max)
      }
      draw()
      const wait = SIZE_EVERY_MS - (performance.now() - lastSent)
      if (wait <= 0) send()
      else if (waiting === undefined) waiting = window.setTimeout(send, wait)
    }
    const end = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
      if (centre) send()
      centre = null
      resizing.active = false
      container.style.cursor = ""
      shown.visible(false)
      shown.getLayer()?.batchDraw()
    }
    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || centre || !isResizeGesture(event.evt)) return
      const at = place(event.evt)
      diameter = latest.current.size
      // The ring's middle is a radius to the left of the pointer, which is on its edge, so
      // that nothing jumps when the press begins.
      centre = { x: at.x - diameter / 2, y: at.y }
      resizing.active = true
      lastSent = performance.now()
      container.style.cursor = "default"
      stage.find(".brush-ring").forEach((node) => node.visible(false))
      shown.position(centre).visible(true)
      draw()
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", end)
      window.addEventListener("pointercancel", end)
    }

    stage.on("pointerdown.resize", onDown)
    return () => {
      stage.off(".resize")
      if (centre) end()
    }
  }, [enabled])

  return (
    <Group ref={layer} listening={false}>
      <Group ref={ring} visible={false}>
        <Circle radius={1} stroke="rgba(0, 0, 0, 0.5)" strokeWidth={3.5} strokeScaleEnabled={false} />
        <Circle radius={1} stroke="#fff" strokeWidth={1.5} strokeScaleEnabled={false} />
      </Group>
    </Group>
  )
}
