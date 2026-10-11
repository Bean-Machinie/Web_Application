import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { Circle, Group } from "react-konva"
import type { Brush } from "@/hooks/use-brush"
import { isResizeGesture, resizing } from "@/lib/brush-resize"
import type { BrushBiome } from "@/lib/biomes/biomes"
import { startStroke } from "@/lib/biomes/brush"
import type { Cells, Stroke } from "@/lib/biomes/brush"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import type { DetailBrush } from "@/lib/details/details"

const union = (a: Cells, b: Cells): Cells => ({
  x0: Math.min(a.x0, b.x0),
  y0: Math.min(a.y0, b.y0),
  x1: Math.max(a.x1, b.x1),
  y1: Math.max(a.y1, b.y1),
})

type Props = {
  enabled: boolean
  // What it paints: a biome or a detail, or with "blend" it softens the biomes already there.
  target: BrushBiome | DetailBrush | "blend"
  // How many canvas pixels a cell of this paint is across.
  cell: number
  brush: Brush
  paint: Paint
  // A 1 for each cell of the paint grid that has land, and the grid's size.
  land: { mask: Uint8Array; cols: number; rows: number }
  surface: Pick<Surface, "draw" | "drawAll" | "adopt">
  onPaint: (paint: Paint) => void
}

// The brush: hold the pointer and drag to paint, with a ring showing the size.
// The stroke is drawn straight onto the picture of its layer as it goes, and becomes
// one change of the paint when the pointer is let go. The ring is only for the
// editor and is left out of the rendered image, as a group of the editor layer.
// Painting redraws the surfaces layer, which holds the biomes, and the ring
// moves in the editor layer: no other layer is touched. The middle button pans.
export function MapBrushLayer({ enabled, target, cell, brush, paint, land, surface, onPaint }: Props) {
  const layer = useRef<Konva.Group>(null)
  const ring = useRef<Konva.Group>(null)
  const latest = useRef({ target, cell, brush, paint, land, onPaint })
  useEffect(() => {
    latest.current = { target, cell, brush, paint, land, onPaint }
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
      stage.findOne(".biomes")?.getLayer()?.batchDraw()
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
      stage.findOne(".biomes")?.getLayer()?.batchDraw()
    }
    const onUp = () => end(true)
    const onCancel = () => end(false)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || stroke || isResizeGesture(event.evt)) return
      const { target, cell, brush, paint, land } = latest.current
      stroke = startStroke(
        paint,
        target,
        land.mask,
        land.cols,
        land.rows,
        brush.strength,
        brush.stretch,
        brush.opacity,
        cell
      )
      base = paint
      last = place(event.evt)
      show(stroke.dab(last[0], last[1], brush.size / 2))
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }
    const onHover = () => {
      if (resizing.active) return
      const at = stage.getRelativePointerPosition()
      if (!at || !ring.current) return
      ring.current.position(at).visible(true)
      layer.current?.getLayer()?.batchDraw()
    }
    const onLeave = () => {
      ring.current?.visible(false)
      layer.current?.getLayer()?.batchDraw()
    }

    stage.on("pointerdown.brush", onDown)
    stage.on("pointermove.brush", onHover)
    stage.on("pointerleave.brush", onLeave)
    return () => {
      stage.off(".brush")
      if (stroke) end(false)
      hint?.visible(false)
      node?.getLayer()?.batchDraw()
    }
  }, [enabled, surface])

  const radius = brush.size / 2
  return (
    <Group ref={layer} listening={false}>
      <Group ref={ring} name="brush-ring" visible={false}>
        <Circle radius={radius} stroke="rgba(0, 0, 0, 0.5)" strokeWidth={3.5} strokeScaleEnabled={false} />
        <Circle radius={radius} stroke="#fff" strokeWidth={1.5} strokeScaleEnabled={false} />
      </Group>
    </Group>
  )
}
