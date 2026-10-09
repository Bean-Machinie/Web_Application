import { useRef, useState } from "react"
import type { MutableRefObject, RefObject } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { useAssetPick } from "@/hooks/use-asset-pick"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { Brush } from "@/hooks/use-brush"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import type { BuilderTool } from "@/lib/map-builder-tools"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"
import { MapArmedGhost } from "./MapArmedGhost"
import { MapStampHint } from "./MapStampHint"
import { MapBuilderStage } from "./MapBuilderStage"
import { MapContextMenu } from "./MapContextMenu"
import type { ContextSpot } from "./MapContextMenu"

type Props = {
  scene: MapScene
  // The painted ground, null until its tiles have loaded.
  terrain: Terrain | null
  tool: BuilderTool
  cutting: boolean
  editable: boolean
  // Shift and Alt are held.
  shift: boolean
  alt: boolean
  editing: AssetEditing
  showAssets: boolean
  // The art picked in the library, stamped by every click on the canvas.
  armed: string | null
  onStamp: (asset: string, at: { x: number; y: number }) => void
  brush: Brush
  viewport: ReturnType<typeof useBuilderViewport>
  stageRef: RefObject<Konva.Stage | null>
  // Kept up to date with where the pointer is on the canvas, for pasting there.
  pointer: MutableRefObject<{ x: number; y: number } | null>
  onLasso: (points: Pair[], cut: boolean, scale: number) => void
  onPaint: (paint: Paint) => void
}

// A press that moves further than this (screen pixels) before it is let go is a
// drag, not a click, and stamps nothing.
const STAMP_SLOP = 4

const CURSORS: Record<BuilderTool, string> = {
  hand: "cursor-grab active:cursor-grabbing",
  land: "cursor-crosshair",
  brush: "cursor-crosshair",
  blend: "cursor-crosshair",
  select: "cursor-default",
}

// The canvas area: the stage, dropping art from the library, stamping the art
// that was picked there, and the right-click menu.
export function MapBuilderCanvas(props: Props) {
  const { scene, terrain, tool, editing, viewport, stageRef, pointer } = props
  const [spot, setSpot] = useState<ContextSpot | null>(null)
  const pick = useAssetPick(scene.assets, scene.canvas)
  const pressed = useRef<{ x: number; y: number } | null>(null)

  const place = (event: { nativeEvent: MouseEvent | DragEvent }) => {
    const stage = stageRef.current
    if (!stage) return null
    stage.setPointersPositions(event.nativeEvent)
    return stage.getRelativePointerPosition()
  }

  return (
    <div
      ref={viewport.container}
      onPointerDown={(event) => {
        viewport.onMiddlePan(event)
        pressed.current = event.button === 0 ? { x: event.clientX, y: event.clientY } : null
      }}
      onPointerUp={(event) => {
        const start = pressed.current
        pressed.current = null
        // While the hand is out (Space), a click is the end of a pan.
        if (!props.armed || !start || tool === "hand") return
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > STAMP_SLOP) return
        const at = place(event)
        if (at) props.onStamp(props.armed, at)
      }}
      onPointerMove={(event) => {
        pointer.current = place(event)
      }}
      onPointerLeave={() => {
        pointer.current = null
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const id = event.dataTransfer.getData("application/x-map-asset")
        const at = id && place(event)
        if (!id || !at) return
        event.preventDefault()
        void editing.place(id, at)
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        const stage = stageRef.current
        const at = place(event)
        if (!stage || !at) return
        const id = pick.at(at.x, at.y)
        // Right-clicking art that is not selected selects it first.
        if (id && !editing.selected.includes(id)) editing.select(id, false)
        setSpot({ x: event.clientX, y: event.clientY, at, onAsset: id !== null })
      }}
      className={`bg-muted relative min-w-0 flex-1 touch-none overflow-hidden ${props.armed ? "cursor-crosshair" : CURSORS[tool]}`}
    >
      {viewport.size.width > 0 && terrain && (
        <MapBuilderStage
          scene={scene}
          terrain={terrain}
          size={viewport.size}
          view={viewport.view}
          stageRef={stageRef}
          tool={tool}
          cutting={props.cutting}
          editable={props.editable}
          editing={editing}
          showAssets={props.showAssets}
          pick={pick}
          snapRotation={props.shift}
          altHeld={props.alt}
          onLasso={props.onLasso}
          brush={props.brush}
          onPaint={props.onPaint}
          onWheel={viewport.onWheel}
          onPan={viewport.onPan}
          onPanning={viewport.follow}
        />
      )}
      {props.armed && (
        <MapArmedGhost asset={props.armed} view={viewport.view} area={viewport.container} />
      )}
      <MapStampHint show={props.armed !== null} inset={viewport.inset} />
      <MapContextMenu spot={spot} editing={editing} onClose={() => setSpot(null)} />
    </div>
  )
}
