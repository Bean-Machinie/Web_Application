import { useState } from "react"
import type { MutableRefObject, RefObject } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { useAssetPick } from "@/hooks/use-asset-pick"
import { useTerrain } from "@/hooks/use-terrain"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { Brush } from "@/hooks/use-brush"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { useBuilderViewport } from "@/hooks/use-builder-viewport"
import type { BuilderTool } from "@/lib/map-builder-tools"
import type { MapScene } from "@/lib/map-scene"
import { MapBuilderStage } from "./MapBuilderStage"
import { MapContextMenu } from "./MapContextMenu"
import type { ContextSpot } from "./MapContextMenu"

type Props = {
  scene: MapScene
  tool: BuilderTool
  cutting: boolean
  editable: boolean
  // Shift is held.
  shift: boolean
  editing: AssetEditing
  showAssets: boolean
  brush: Brush
  viewport: ReturnType<typeof useBuilderViewport>
  stageRef: RefObject<Konva.Stage | null>
  // Kept up to date with where the pointer is on the canvas, for pasting there.
  pointer: MutableRefObject<{ x: number; y: number } | null>
  onLasso: (points: Pair[], cut: boolean, scale: number) => void
  onPaint: (paint: Paint) => void
}

const CURSORS: Record<BuilderTool, string> = {
  hand: "cursor-grab active:cursor-grabbing",
  land: "cursor-crosshair",
  brush: "cursor-crosshair",
  blend: "cursor-crosshair",
  select: "cursor-default",
}

// The canvas area: the stage, dropping art from the library,
// and the right-click menu.
export function MapBuilderCanvas(props: Props) {
  const { scene, tool, editing, viewport, stageRef, pointer } = props
  const [spot, setSpot] = useState<ContextSpot | null>(null)
  const terrain = useTerrain(scene.canvas)
  const pick = useAssetPick(scene.assets, scene.canvas)

  const place = (event: { nativeEvent: MouseEvent | DragEvent }) => {
    const stage = stageRef.current
    if (!stage) return null
    stage.setPointersPositions(event.nativeEvent)
    return stage.getRelativePointerPosition()
  }

  return (
    <div
      ref={viewport.container}
      onPointerDown={viewport.onMiddlePan}
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
      className={`bg-muted relative min-w-0 flex-1 touch-none overflow-hidden ${CURSORS[tool]}`}
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
          onLasso={props.onLasso}
          brush={props.brush}
          onPaint={props.onPaint}
          onWheel={viewport.onWheel}
          onPan={viewport.onPan}
        />
      )}
      <MapContextMenu spot={spot} editing={editing} onClose={() => setSpot(null)} />
    </div>
  )
}
