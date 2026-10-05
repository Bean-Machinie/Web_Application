import { useMemo } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import { Image as KonvaImage, Layer, Rect, Stage } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { renderBackground } from "@/lib/map-background"
import type { MapScene } from "@/lib/map-scene"

type Props = {
  scene: MapScene
  size: { width: number; height: number }
  view: BuilderView
  stageRef: RefObject<Konva.Stage | null>
  onWheel: (event: Konva.KonvaEventObject<WheelEvent>) => void
  onPan: (x: number, y: number) => void
}

// The canvas, drawn in layers that follow the scene's fixed order. "chrome"
// layers are only for the editor and never end up in the rendered image.
export function MapBuilderStage({ scene, size, view, stageRef, onWheel, onPan }: Props) {
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
      draggable
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
    </Stage>
  )
}
