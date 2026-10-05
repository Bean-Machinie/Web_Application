import { useMemo } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import { Image as KonvaImage, Layer, Rect, Stage } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { renderBackground } from "@/lib/map-background"
import type { MapScene } from "@/lib/map-scene"
import type { Pair } from "polygon-clipping"
import type { BuilderTool } from "./MapBuilderSidebar"
import { MapLandLayer } from "./MapLandLayer"
import { MapLassoLayer } from "./MapLassoLayer"

type Props = {
  scene: MapScene
  size: { width: number; height: number }
  view: BuilderView
  stageRef: RefObject<Konva.Stage | null>
  tool: BuilderTool
  // Whether a lasso now cuts land away instead of adding it.
  cutting: boolean
  // False while the scene must not change, as when publishing.
  editable: boolean
  onLasso: (points: Pair[], cut: boolean, scale: number) => void
  onWheel: (event: Konva.KonvaEventObject<WheelEvent>) => void
  onPan: (x: number, y: number) => void
}

// The canvas, drawn in layers that follow the scene's fixed order. "chrome"
// layers are only for the editor and never end up in the rendered image.
export function MapBuilderStage(props: Props) {
  const { scene, size, view, stageRef, tool, cutting, editable, onWheel, onPan } = props
  const { canvas } = scene
  const background = useMemo(() => renderBackground(canvas), [canvas])

  return (
    <Stage
      ref={stageRef}
      width={size.width}
      height={size.height}
      x={view.x}
      y={view.y}
      scaleX={view.scale}
      scaleY={view.scale}
      // Only the pan tool drags the canvas; the middle button pans from any
      // tool (see useBuilderViewport).
      draggable={tool === "hand"}
      onWheel={onWheel}
      onDragEnd={(event) => {
        if (event.target === event.target.getStage()) onPan(event.target.x(), event.target.y())
      }}
    >
      {/* The canvas lies on the surface like a sheet. */}
      <Layer name="chrome" listening={false}>
        <Rect
          width={canvas.width}
          height={canvas.height}
          fill="#000"
          shadowColor="#000"
          shadowBlur={90}
          shadowOffsetY={24}
          shadowOpacity={0.3}
        />
      </Layer>
      <Layer listening={false}>
        <KonvaImage image={background} width={canvas.width} height={canvas.height} />
      </Layer>
      <MapLandLayer land={scene.land} background={canvas.background} />
      <MapLassoLayer
        enabled={editable && tool === "land"}
        cutting={cutting}
        onLasso={props.onLasso}
      />
    </Stage>
  )
}
