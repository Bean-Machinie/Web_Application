import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { Circle, Group, Layer } from "react-konva"
import type { Brush } from "@/hooks/use-brush"
import { startStroke } from "@/lib/biomes/brush"
import type { Cells, Stroke } from "@/lib/biomes/brush"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"

const union = (a: Cells, b: Cells): Cells => ({
  x0: Math.min(a.x0, b.x0),
  y0: Math.min(a.y0, b.y0),
  x1: Math.max(a.x1, b.x1),
  y1: Math.max(a.y1, b.y1),
})

type Props = {
  enabled: boolean
  brush: Brush
  paint: Paint
  // A 1 for each cell of the paint grid that has land, and the grid's size.
  land: { mask: Uint8Array; cols: number; rows: number }
  surface: Surface
  onPaint: (paint: Paint) => void
}

// The brush: hold the pointer and drag to paint, with a ring showing the size.
// The stroke is drawn straight onto the biome picture as it goes, and becomes
// one change of the paint when the pointer is let go. The ring is only for the
// editor and is left out of the rendered image. The middle button pans.
export function MapBrushLayer({ enabled, brush, paint, land, surface, onPaint }: Props) {
  const layer = useRef<Konva.Layer>(null)
  const ring = useRef<Konva.Group>(null)
  const latest = useRef({ brush, paint, land, onPaint })
  useEffect(() => {
    latest.current = { brush, paint, land, onPaint }
  })

  useEffect(() => {
    const stage = layer.current?.getStage()
    const hint = ring.current
    const node = layer.current
    if (!enabled || !stage) return

    let stroke: Stroke | null = null
    let base: Paint | null = null
    let last: Pair | null = null
    const place = (event: PointerEvent): Pair => {
      stage.setPointersPositions(event)
      const { x, y } = stage.getRelativePointerPosition()!
      return [x, y]
    }
    const show = (cells: Cells) => {
      const before = base!
      const { working } = stroke!
      surface.draw(cells, (key) => working.get(key)?.work ?? before.get(key))
      stage.findOne<Konva.Layer>(".biomes")?.batchDraw()
    }

    const onMove = (event: PointerEvent) => {
      if (!stroke || !last) return
      // Every position the pointer passed through since the last event, where
      // the browser reports them, so a fast stroke is not cut into long straight runs.
      const events = event.getCoalescedEvents?.()
      let cells: Cells | null = null
      for (const each of events?.length ? events : [event]) {
        const next = place(each)
        const done = stroke.line(last[0], last[1], next[0], next[1], latest.current.brush.size / 2)
        last = next
        if (done) cells = cells ? union(cells, done) : done
      }
      if (cells) show(cells)
    }
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      const done = stroke
      const before = base
      stroke = base = last = null
      if (!done || !before) return
      const painted = done.finish()
      if (commit && painted !== before) {
        surface.adopt(painted)
        latest.current.onPaint(painted)
        return
      }
      // Nothing to keep: the picture goes back to how it was.
      surface.drawAll(before)
      stage.findOne<Konva.Layer>(".biomes")?.batchDraw()
    }
    const onUp = () => end(true)
    const onCancel = () => end(false)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || stroke) return
      const { brush, paint, land } = latest.current
      stroke = startStroke(paint, brush.biome, land.mask, land.cols, land.rows)
      base = paint
      last = place(event.evt)
      show(stroke.dab(last[0], last[1], brush.size / 2))
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }
    const onHover = () => {
      const at = stage.getRelativePointerPosition()
      if (!at || !ring.current) return
      ring.current.position(at).visible(true)
      layer.current?.batchDraw()
    }
    const onLeave = () => {
      ring.current?.visible(false)
      layer.current?.batchDraw()
    }

    stage.on("pointerdown.brush", onDown)
    stage.on("pointermove.brush", onHover)
    stage.on("pointerleave.brush", onLeave)
    return () => {
      stage.off(".brush")
      if (stroke) end(false)
      hint?.visible(false)
      node?.batchDraw()
    }
  }, [enabled, surface])

  const radius = brush.size / 2
  return (
    <Layer ref={layer} name="chrome" listening={false}>
      <Group ref={ring} visible={false}>
        <Circle radius={radius} stroke="rgba(0, 0, 0, 0.5)" strokeWidth={3.5} strokeScaleEnabled={false} />
        <Circle radius={radius} stroke="#fff" strokeWidth={1.5} strokeScaleEnabled={false} />
      </Group>
    </Layer>
  )
}
