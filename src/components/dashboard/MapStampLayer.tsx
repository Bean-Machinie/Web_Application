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
import { shapeOutline } from "@/lib/stamps/stamp-corners"
import { placeStamp } from "@/lib/stamps/stamp-outline"
import { drawStampPreview } from "@/lib/stamps/stamp-preview"
import { createTrail } from "@/lib/stamps/stamp-trail"
import type { Pose } from "@/lib/stamps/stamp-trail"
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
  onApply: (outline: Polygon, cut: boolean, pins: Pair[]) => void
}

// Over the shape the pointer is a mover.
const setCursor = (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
  const container = event.target.getStage()?.container()
  if (container) container.style.cursor = cursor
}

// The Shapes sub tool: drag from corner to corner to fit the shape into that box (it keeps
// its own proportions; with Shift it stretches), or click to place it at a size; then it stays live,
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
  const trail = useRef(createTrail())
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

  const syncTrail = () => latest.current.placement.setTrail({ canUndo: trail.current.canUndo(), canRedo: trail.current.canRedo() })

  const poseOf = (node: Konva.Rect): Pose => ({
    x: node.x(),
    y: node.y(),
    width: node.width(),
    height: node.height(),
    offsetX: node.offsetX(),
    offsetY: node.offsetY(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    rotation: node.rotation(),
  })

  // The shape's steps are kept as it is edited.
  function edited() {
    if (phase.current === "live" && box.current && trail.current.push(poseOf(box.current))) syncTrail()
  }

  // The shape taken away, or put back in a pose.
  function hide() {
    phase.current = "idle"
    transformer.current?.nodes([])
    box.current?.visible(false).listening(false).draggable(false)
    latest.current.placement.setLive(false)
    const container = group.current?.getStage()?.container()
    if (container) container.style.cursor = ""
    redraw()
  }
  function show(pose: Pose) {
    phase.current = "live"
    box.current?.setAttrs(pose).visible(true).listening(true).draggable(true)
    transformer.current?.listening(true)
    transformer.current?.nodes(box.current ? [box.current] : [])
    transformer.current?.forceUpdate()
    latest.current.placement.setLive(true)
    redraw()
  }
  // Dropped for good, with its steps.
  function reset() {
    hide()
    trail.current.clear()
    syncTrail()
  }

  // Back a step of the shape's own: its last edit, or if none, its creation.
  function undo() {
    const pose = trail.current.undo()
    if (pose === undefined) return
    if (pose === null) hide()
    else show(pose)
    syncTrail()
  }
  function redo() {
    const pose = trail.current.redo()
    if (!pose) return
    show(pose)
    syncTrail()
  }

  function apply() {
    const node = box.current
    if (phase.current !== "live" || !node) return
    const { polygon, width, height } = outline(node)
    const { stamp, placement, cutting, onApply } = latest.current
    const shaped = shapeOutline(stamp, polygon, placement.rounding)
    placement.lastSize.current = { width, height }
    reset()
    onApply(shaped.outline, cutting, shaped.pins)
  }

  function flip(axis: "x" | "y") {
    const node = box.current
    if (phase.current !== "live" || !node) return
    if (axis === "x") node.scaleX(-node.scaleX())
    else node.scaleY(-node.scaleY())
    transformer.current?.forceUpdate()
    redraw()
    edited()
  }

  useEffect(() => {
    const stage = group.current?.getStage()
    if (!enabled || !stage) return
    const { controls } = latest.current.placement
    controls.current = { apply, cancel: reset, flip, undo, redo }

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
      // Held to its own proportions, as the handles at its corners hold it; Shift stretches it freely.
      frameTo(dragFrame(from, to, !event.shiftKey, latest.current.stamp.aspect))
      box.current?.visible(true)
      // The box and its handles show as the shape is pulled out, but take no presses until it is let go.
      const handles = transformer.current
      if (handles && handles.nodes().length === 0 && box.current) {
        handles.listening(false)
        handles.nodes([box.current])
      }
      handles?.forceUpdate()
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
      if (!box.current) return
      trail.current.start(poseOf(box.current))
      show(poseOf(box.current))
      syncTrail()
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
      // A new shape starts new steps; the old ones, if it had been taken away, cannot be had again.
      trail.current.clear()
      syncTrail()
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
      reset()
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // What changes how it looks while it is live shows at once.
  const { stamp, cutting, style, terrain } = props
  useEffect(() => {
    redraw()
  }, [stamp, cutting, style.roundness, style.outline, terrain, props.placement.rounding])

  return (
    <Group ref={group} listening={enabled}>
      <Shape
        listening={false}
        sceneFunc={(context) => {
          const node = box.current
          if (!node || phase.current === "idle") return
          const { cutting, canvas, style, terrain } = latest.current
          const { stamp, placement } = latest.current
          const shaped = shapeOutline(stamp, outline(node).polygon, placement.rounding)
          drawStampPreview(context, shaped.outline, shaped.pins, { canvas, style, terrain, cutting })
        }}
      />
      <Rect
        ref={box}
        visible={false}
        listening={false}
        onDragEnd={edited}
        onMouseEnter={(event) => setCursor(event, "move")}
        onMouseLeave={(event) => setCursor(event, "")}
        // Only the box takes the pointer, to move the shape.
        hitFunc={(context, shape) => {
          context.setAttr("fillStyle", shape.colorKey)
          context.fillRect(0, 0, shape.width(), shape.height())
        }}
      />
      <MapStampHandles transformer={transformer} snapRotation={snapRotation} onEdited={edited} />
    </Group>
  )
}
