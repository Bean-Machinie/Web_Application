import { useEffect, useRef, useState } from "react"
import Konva from "konva"
import { Group, Line, Rect, Transformer } from "react-konva"
import type { Pair } from "polygon-clipping"
import type { SelectMode, SelectOp } from "@/lib/map-builder-tools"
import type { AssetPatch } from "@/lib/map-asset-edit"
import type { AssetPicker } from "@/lib/map-asset-pick"
import type { PlacedAsset } from "@/lib/map-scene"

const CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"]
const ALL_ANCHORS = [...CORNERS, "top-center", "middle-left", "middle-right", "bottom-center"]
const SNAPS = Array.from({ length: 24 }, (_, index) => index * 15)
// A press on the empty canvas that moves less than this (screen pixels) is a
// click, which clears the selection; more is a drag box.
const DRAG_PX = 4
const BLUE = "#2f6fed"
const RED = "#ef4444"
// A point of a lasso is only kept when the pointer has moved this far, in screen pixels.
const LASSO_STEP = 3

// Shift adds, Alt takes out, both keep what is in both, as in Photoshop.
const opOf = (shift: boolean, alt: boolean): SelectOp =>
  shift && alt ? "intersect" : shift ? "add" : alt ? "subtract" : "replace"

type Props = {
  enabled: boolean
  selected: string[]
  // The placed assets, so the handles follow when they are redrawn or changed.
  assets: PlacedAsset[]
  // Shift is held: scaling is free, and rotating snaps to 15 degrees.
  snapRotation: boolean
  onSelect: (ids: string[], op: SelectOp) => void
  // How the empty canvas picks: a box dragged out, or an outline drawn by hand.
  mode: SelectMode
  // Art is found by place, not by a shape each: a press on it picks it and
  // starts moving it.
  pick: AssetPicker
  onPick: (id: string, additive: boolean) => void
  // Alt-drag: copies of the chosen art (or of the pressed piece) take its place
  // and are dragged on; gives the copy of the piece pressed.
  onClone: (ids: string[], pressed: string) => string | null
  onChange: (patches: AssetPatch[]) => void
}

type Box = { x: number; y: number; width: number; height: number }

// What is drawn over the art while editing it: handles to scale and rotate the
// selection, and the box or outline dragged on the empty canvas to select what it
// touches (Shift adds to the selection, Alt takes out of it). Alt and a drag on art drags a copy of it; the copy is made once the
// pointer has moved, so an Alt-click alone leaves nothing behind. All of it is
// left out of the rendered image, as a group of the editor layer, so that moving
// the handles redraws only that layer.
export function MapSelectionLayer(props: Props) {
  const { enabled, selected, assets, snapRotation } = props
  const layer = useRef<Konva.Group>(null)
  const transformer = useRef<Konva.Transformer>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [outline, setOutline] = useState<number[]>([])
  // What the pick being drawn does, which colours it: blue to add or replace, red to take out.
  const [drawing, setDrawing] = useState<SelectOp>("replace")
  const latest = useRef(props)
  useEffect(() => {
    latest.current = props
  })
  // The piece just picked, to be moved once it has a shape.
  const picked = useRef<string | null>(null)

  useEffect(() => {
    const stage = layer.current?.getStage()
    if (!stage || !transformer.current) return
    const nodes = enabled
      ? selected.flatMap((id) => stage.findOne(`#${id}`) ?? [])
      : []
    transformer.current.nodes(nodes)
    transformer.current.getLayer()?.batchDraw()
    const pending = nodes.find((node) => node.id() === picked.current)
    if (pending) {
      picked.current = null
      pending.startDrag()
    }
  }, [enabled, selected, assets])

  useEffect(() => {
    const stage = layer.current?.getStage()
    if (!enabled || !stage) return

    let start: {
      x: number
      y: number
      shift: boolean
      alt: boolean
      mode: SelectMode
      points: Pair[]
      screen: { x: number; y: number }
    } | null = null
    let stopClone: (() => void) | null = null
    const place = (event: PointerEvent) => {
      stage.setPointersPositions(event)
      return stage.getRelativePointerPosition()!
    }
    const onMove = (event: PointerEvent) => {
      if (!start) return
      const at = place(event)
      if (start.mode === "lasso") {
        const last = start.points[start.points.length - 1]
        if (Math.hypot(at.x - last[0], at.y - last[1]) < LASSO_STEP / Math.abs(stage.scaleX())) return
        start.points.push([at.x, at.y])
        setOutline(start.points.flat())
        return
      }
      setBox({
        x: Math.min(start.x, at.x),
        y: Math.min(start.y, at.y),
        width: Math.abs(at.x - start.x),
        height: Math.abs(at.y - start.y),
      })
    }
    const end = (event: PointerEvent | null) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      if (start && event) {
        const moved = Math.hypot(event.clientX - start.screen.x, event.clientY - start.screen.y)
        const at = place(event)
        const area: Box = {
          x: Math.min(start.x, at.x),
          y: Math.min(start.y, at.y),
          width: Math.abs(at.x - start.x),
          height: Math.abs(at.y - start.y),
        }
        // Shift or Alt at either end of the drag counts, so letting go of one first does not matter.
        const op = opOf(start.shift || event.shiftKey, start.alt || event.altKey)
        if (moved < DRAG_PX) {
          // A click on the empty canvas lets go of the selection; with a key held it changes nothing.
          if (op === "replace") latest.current.onSelect([], "replace")
        } else if (start.mode === "lasso") {
          // An outline of fewer than three points has no inside.
          const hit = start.points.length >= 3 ? latest.current.pick.inside(start.points) : []
          latest.current.onSelect(hit, op)
        } else {
          latest.current.onSelect(latest.current.pick.within(area), op)
        }
      }
      start = null
      setBox(null)
      setOutline([])
    }
    const onUp = (event: PointerEvent) => end(event)
    const onCancel = () => end(null)

    // Pressed on art with Alt: when the pointer has moved, copies are made and
    // dragged on, and the art pressed stays where it was.
    const beginClone = (id: string, down: PointerEvent) => {
      const { selected } = latest.current
      const ids = selected.includes(id) ? selected : [id]
      const from = { x: down.clientX, y: down.clientY }
      const stop = () => {
        window.removeEventListener("pointermove", onCloneMove)
        window.removeEventListener("pointerup", stop)
        window.removeEventListener("pointercancel", stop)
        stopClone = null
      }
      const onCloneMove = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - from.x, event.clientY - from.y) < DRAG_PX) return
        stop()
        stage.setPointersPositions(event)
        const copy = latest.current.onClone(ids, id)
        if (copy) picked.current = copy
      }
      window.addEventListener("pointermove", onCloneMove)
      window.addEventListener("pointerup", stop)
      window.addEventListener("pointercancel", stop)
      stopClone = stop
    }

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || start || stopClone) return
      // Art is a shape only once chosen; the handles are not art.
      const art = event.target !== stage && event.target.name() === "asset" ? event.target.id() : null
      if (event.evt.altKey && (event.target === stage || art)) {
        const at = place(event.evt)
        const id = art ?? latest.current.pick.at(at.x, at.y)
        if (id) return beginClone(id, event.evt)
      }
      // Otherwise only the bare canvas: art and handles take their own presses.
      if (event.target !== stage) return
      const at = place(event.evt)
      const id = latest.current.pick.at(at.x, at.y)
      if (id) {
        const node = stage.findOne(`#${id}`)
        if (node) node.startDrag()
        else picked.current = id
        latest.current.onPick(id, event.evt.shiftKey)
        return
      }
      start = {
        ...at,
        shift: event.evt.shiftKey,
        alt: event.evt.altKey,
        mode: latest.current.mode,
        points: [[at.x, at.y]],
        screen: { x: event.evt.clientX, y: event.evt.clientY },
      }
      setDrawing(opOf(start.shift, start.alt))
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }

    // Over art the pointer is a mover; art has no shape of its own to say so.
    let over = false
    const onHover = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.buttons !== 0 || event.target !== stage) return
      const at = place(event.evt)
      const now = latest.current.pick.at(at.x, at.y) !== null
      if (now === over) return
      over = now
      stage.container().style.cursor = now ? "move" : ""
    }

    stage.on("pointerdown.marquee", onDown)
    stage.on("pointermove.hover", onHover)
    return () => {
      stage.off("pointerdown.marquee")
      stage.off("pointermove.hover")
      if (start) end(null)
      stopClone?.()
    }
  }, [enabled])

  const finishTransform = () => {
    const patches = (transformer.current?.nodes() ?? []).map((node) => ({
      id: node.id(),
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    }))
    props.onChange(patches)
  }

  return (
    <Group ref={layer} listening={enabled}>
      <Transformer
        ref={transformer}
        // Scaling keeps the proportions; Shift frees them, and brings out the
        // handles on the sides. Rotation snaps to 15 degrees with Shift held.
        keepRatio
        shiftBehavior="inverted"
        enabledAnchors={snapRotation ? ALL_ANCHORS : CORNERS}
        rotationSnaps={snapRotation ? SNAPS : []}
        rotationSnapTolerance={7.5}
        flipEnabled
        ignoreStroke
        borderStroke={BLUE}
        borderStrokeWidth={1.5}
        anchorStroke={BLUE}
        anchorFill="#ffffff"
        anchorSize={10}
        anchorCornerRadius={2}
        rotateAnchorOffset={26}
        onTransformEnd={finishTransform}
      />
      {box && (
        <Rect
          {...box}
          fill={drawing === "subtract" ? "rgba(239, 68, 68, 0.12)" : "rgba(47, 111, 237, 0.1)"}
          stroke={drawing === "subtract" ? RED : BLUE}
          strokeWidth={1}
          dash={[5, 4]}
          strokeScaleEnabled={false}
          listening={false}
        />
      )}
      {outline.length >= 4 && (
        <>
          <Line
            points={outline}
            closed
            fill={drawing === "subtract" ? "rgba(239, 68, 68, 0.12)" : "rgba(47, 111, 237, 0.1)"}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth={2.5}
            strokeScaleEnabled={false}
            lineJoin="round"
            listening={false}
          />
          <Line
            points={outline}
            closed
            stroke={drawing === "subtract" ? RED : BLUE}
            strokeWidth={1}
            dash={[5, 4]}
            strokeScaleEnabled={false}
            lineJoin="round"
            listening={false}
          />
        </>
      )}
    </Group>
  )
}
