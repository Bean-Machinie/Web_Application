import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { Pair, Polygon } from "polygon-clipping"
import { Group, Rect, Shape } from "react-konva"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import type { Terrain } from "@/lib/terrain"
import { clickFrame, dragFrame } from "@/lib/stamps/stamp-frame"
import type { Frame } from "@/lib/stamps/stamp-frame"
import { placeStamp } from "@/lib/stamps/stamp-outline"
import { drawStampPreview } from "@/lib/stamps/stamp-preview"
import type { Stamp } from "@/lib/stamps/stamps"
import { LEAST, MapStampHandles } from "./MapStampHandles"

// A press that moves less than this (screen pixels) before it is let go is a click.
const SLOP = 4

type Props = {
  enabled: boolean
  stamp: Stamp
  // Whether the shape cuts land away instead of adding it.
  cutting: boolean
  placement: StampPlacement
  canvas: MapScene["canvas"]
  style: MapStyle
  terrain: Terrain
  // Shift is held: rotating snaps to 15 degrees.
  snapRotation: boolean
  onApply: (outline: Polygon, cut: boolean) => void
}

// The Shapes sub tool: drag from corner to corner to fit the shape into that box (with
// Shift it keeps its proportions), or click to place it at a size; then it stays live,
// with handles to move, stretch, scale and turn it, until it is applied or cancelled.
// It is drawn as it will be: in the land's ground when it adds, in the sea's when it cuts,
// the corners rounded as the land's are, and the coast's line. Nothing else of the map
// is redrawn for it, and it is the editor's only, as a group of the editor layer. The
// box is a rectangle that only takes the handles and the dragging; the shape reads where
// it is from that rectangle each time it is drawn, so a drag costs no render of React.
export function MapStampLayer(props: Props) {
  const { enabled, snapRotation } = props
  const group = useRef<Konva.Group>(null)
  const box = useRef<Konva.Rect>(null)
  const transformer = useRef<Konva.Transformer>(null)
  const phase = useRef<"idle" | "placing" | "live">("idle")
  const latest = useRef(props)
  useEffect(() => {
    latest.current = props
  })

  // The shape's outline in canvas pixels, and how big its box is.
  function outline(node: Konva.Rect) {
    const transform = node.getTransform()
    const width = Math.abs(node.width() * node.scaleX())
    const height = Math.abs(node.height() * node.scaleY())
    const polygon = placeStamp(latest.current.stamp, width, height, (u, v): Pair => {
      const point = transform.point({ x: u * node.width(), y: v * node.height() })
      return [point.x, point.y]
    })
    return { polygon, width, height }
  }

  const redraw = () => group.current?.getLayer()?.batchDraw()
  const frameTo = ({ x, y, width, height }: Frame) =>
    box.current?.setAttrs({ x, y, width, height, offsetX: width / 2, offsetY: height / 2, scaleX: 1, scaleY: 1, rotation: 0 })

  function reset() {
    phase.current = "idle"
    transformer.current?.nodes([])
    box.current?.visible(false).listening(false).draggable(false)
    latest.current.placement.setLive(false)
    redraw()
  }

  function apply() {
    const node = box.current
    if (phase.current !== "live" || !node) return
    const { polygon, width, height } = outline(node)
    const { placement, cutting, onApply } = latest.current
    placement.lastSize.current = { width, height }
    reset()
    onApply(polygon, cutting)
  }

  function flip(axis: "x" | "y") {
    const node = box.current
    if (phase.current !== "live" || !node) return
    if (axis === "x") node.scaleX(-node.scaleX())
    else node.scaleY(-node.scaleY())
    transformer.current?.forceUpdate()
    redraw()
  }

  useEffect(() => {
    const stage = group.current?.getStage()
    if (!enabled || !stage) return
    const { controls } = latest.current.placement
    controls.current = { apply, cancel: reset, flip }

    const place = (event: PointerEvent): Pair => {
      stage.setPointersPositions(event)
      const { x, y } = stage.getRelativePointerPosition()!
      return [x, y]
    }
    let from: Pair | null = null
    let dragged = false

    const onMove = (event: PointerEvent) => {
      if (!from) return
      const to = place(event)
      if (!dragged && Math.hypot(to[0] - from[0], to[1] - from[1]) * Math.abs(stage.scaleX()) < SLOP) return
      dragged = true
      frameTo(dragFrame(from, to, event.shiftKey, latest.current.stamp.aspect))
      box.current?.visible(true)
      redraw()
    }
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      const start = from
      from = null
      if (!start || !commit) return reset()
      const { stamp, canvas, placement } = latest.current
      if (!dragged) frameTo(clickFrame(start, stamp.aspect, canvas, placement.lastSize.current))
      // Too small to be a shape.
      if ((box.current?.width() ?? 0) < LEAST || (box.current?.height() ?? 0) < LEAST) return reset()
      phase.current = "live"
      box.current?.visible(true).listening(true).draggable(true)
      transformer.current?.nodes(box.current ? [box.current] : [])
      placement.setLive(true)
      redraw()
    }
    const onUp = () => end(true)
    const onCancel = () => end(false)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || from) return
      if (phase.current === "live") {
        // A press on the shape or its handles is theirs; one anywhere else applies it.
        const target = event.target
        if (target !== box.current && target.getParent() !== transformer.current) apply()
        return
      }
      from = place(event.evt)
      dragged = false
      phase.current = "placing"
      frameTo({ x: from[0], y: from[1], width: 0, height: 0 })
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }

    stage.on("pointerdown.stamp", onDown)
    return () => {
      stage.off(".stamp")
      if (from) end(false)
      controls.current = null
      // Changing tool applies the shape (see useBuilderTools); anything else drops it.
      if (phase.current !== "idle") reset()
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // What changes how it looks while it is live shows at once.
  const { stamp, cutting, style, terrain } = props
  useEffect(() => {
    redraw()
  }, [stamp, cutting, style.roundness, style.outline, terrain])

  return (
    <Group ref={group} listening={enabled}>
      <Shape
        listening={false}
        sceneFunc={(context) => {
          const node = box.current
          if (!node || phase.current === "idle") return
          const { cutting, canvas, style, terrain } = latest.current
          drawStampPreview(context, outline(node).polygon, { canvas, style, terrain, cutting })
        }}
      />
      <Rect
        ref={box}
        visible={false}
        listening={false}
        // Only the box takes the pointer, to move the shape.
        hitFunc={(context, shape) => {
          context.setAttr("fillStyle", shape.colorKey)
          context.fillRect(0, 0, shape.width(), shape.height())
        }}
      />
      <MapStampHandles transformer={transformer} snapRotation={snapRotation} />
    </Group>
  )
}
