import { useMemo } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import { Image as KonvaImage, Layer, Rect, Stage } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { useShownLand } from "@/hooks/use-shown-land"
import { renderBackground } from "@/lib/map-background"
import type { MapScene } from "@/lib/map-scene"
import type { Pair } from "polygon-clipping"
import type { BuilderTool } from "@/lib/map-builder-tools"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { useBiomeSurface } from "@/hooks/use-biome-surface"
import type { Brush } from "@/hooks/use-brush"
import { landMask } from "@/lib/biomes/land-mask"
import { gridSize } from "@/lib/biomes/paint-tiles"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { MapAssetsLayer } from "./MapAssetsLayer"
import { MapBiomeLayer } from "./MapBiomeLayer"
import { MapBrushLayer } from "./MapBrushLayer"
import { MapLandLayer } from "./MapLandLayer"
import { MapWaterLayer } from "./MapWaterLayer"
import { MapLassoLayer } from "./MapLassoLayer"
import { MapSelectionLayer } from "./MapSelectionLayer"

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
  editing: AssetEditing
  brush: Brush
  onPaint: (paint: Paint) => void
  // Shift is held: rotating snaps to 15 degrees.
  snapRotation: boolean
  onWheel: (event: Konva.KonvaEventObject<WheelEvent>) => void
  onPan: (x: number, y: number) => void
}

// The canvas, drawn in layers that follow the scene's fixed order. "chrome"
// layers are only for the editor and never end up in the rendered image.
export function MapBuilderStage(props: Props) {
  const { scene, size, view, stageRef, tool, cutting, editable, editing, onWheel, onPan } = props
  const { canvas } = scene
  const background = useMemo(() => renderBackground(canvas), [canvas])
  const land = useShownLand(scene.land, scene.style.roundness, canvas)
  const surface = useBiomeSurface(canvas)
  // Paint sticks where the land is as it is shown, rounded corners and all, so
  // that none of the land you see is out of its reach.
  const mask = useMemo(() => ({ mask: landMask(land, canvas), ...gridSize(canvas) }), [land, canvas])

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
      <MapWaterLayer land={land} style={scene.style} canvas={canvas} view={view} size={size} />
      <MapLandLayer land={land} background={canvas.background} />
      <MapBiomeLayer land={land} canvas={canvas} style={scene.style} paint={scene.paint} surface={surface} />
      <MapAssetsLayer
        canvas={canvas}
        land={land}
        paint={scene.paint}
        surface={surface}
        backdrop={background}
        view={view}
        size={size}
        assets={scene.assets}
        selected={editing.selected}
        editable={editable && tool === "select"}
        onSelect={editing.select}
        onChange={editing.commit}
      />
      <MapLassoLayer
        enabled={editable && tool === "land"}
        cutting={cutting}
        onLasso={props.onLasso}
      />
      <MapBrushLayer
        enabled={editable && (tool === "brush" || tool === "blend")}
        blending={tool === "blend"}
        brush={props.brush}
        paint={scene.paint}
        land={mask}
        surface={surface}
        onPaint={props.onPaint}
      />
      <MapSelectionLayer
        enabled={editable && tool === "select"}
        selected={editing.selected}
        assets={scene.assets}
        snapRotation={props.snapRotation}
        onSelect={editing.selectMany}
        onChange={editing.commit}
      />
    </Stage>
  )
}
