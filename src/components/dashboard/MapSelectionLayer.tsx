import { useEffect, useRef, useState } from "react"
import Konva from "konva"
import { Group, Rect, Transformer } from "react-konva"
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

type Props = {
  enabled: boolean
  selected: string[]
  // The placed assets, so the handles follow when they are redrawn or changed.
  assets: PlacedAsset[]
  // Shift is held: scaling is free, and rotating snaps to 15 degrees.
  snapRotation: boolean
  onSelect: (ids: string[], additive: boolean) => void
  // Art is found by place, not by a shape each: a press on it picks it and
  // starts moving it.
  pick: AssetPicker
  onPick: (id: string, additive: boolean) => void
  onChange: (patches: AssetPatch[]) => void
}

type Box = { x: number; y: number; width: number; height: number }

// What is drawn over the art while editing it: handles to scale and rotate the
// selection, and the box dragged on the empty canvas to select what it
// touches. All of it is left out of the rendered image, as a group of the editor
// layer, so that moving the handles redraws only that layer.
export function MapSelectionLayer(props: Props) {
  const { enabled, selected, assets, snapRotation } = props
  const layer = useRef<Konva.Group>(null)
  const transformer = useRef<Konva.Transformer>(null)
  const [box, setBox] = useState<Box | null>(null)
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

    let start: { x: number; y: number; screen: { x: number; y: number } } | null = null
    const place = (event: PointerEvent) => {
      stage.setPointersPositions(event)
      return stage.getRelativePointerPosition()!
    }
    const onMove = (event: PointerEvent) => {
      if (!start) return
      const at = place(event)
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
        const hit = moved < DRAG_PX ? [] : latest.current.pick.within(area)
        latest.current.onSelect(hit, event.shiftKey)
      }
      start = null
      setBox(null)
    }
    const onUp = (event: PointerEvent) => end(event)
    const onCancel = () => end(null)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      // Only the bare canvas: art and handles take their own presses.
      if (event.evt.button !== 0 || event.target !== stage || start) return
      const at = place(event.evt)
      const id = latest.current.pick.at(at.x, at.y)
      if (id) {
        const node = stage.findOne(`#${id}`)
        if (node) node.startDrag()
        else picked.current = id
        latest.current.onPick(id, event.evt.shiftKey)
        return
      }
      start = { ...at, screen: { x: event.evt.clientX, y: event.evt.clientY } }
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
          fill="rgba(47, 111, 237, 0.1)"
          stroke={BLUE}
          strokeWidth={1}
          strokeScaleEnabled={false}
          listening={false}
        />
      )}
    </Group>
  )
}
