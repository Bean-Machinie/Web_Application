import { useMemo, useState } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import { useShownLand } from "@/hooks/use-shown-land"
import type { MapScene } from "@/lib/map-scene"
import type { Pair, Polygon } from "polygon-clipping"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { BuilderTool, LandTool, SelectMode } from "@/lib/map-builder-tools"
import type { Stamp } from "@/lib/stamps/stamps"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { AssetPicker } from "@/lib/map-asset-pick"
import { useBiomeSurface } from "@/hooks/use-biome-surface"
import { useDetailSurface } from "@/hooks/use-detail-surface"
import type { Brush } from "@/hooks/use-brush"
import { landMask } from "@/lib/biomes/land-mask"
import { PAINT_CELL } from "@/lib/biomes/biomes"
import { gridSize } from "@/lib/biomes/paint-tiles"
import { DETAIL_CELL } from "@/lib/details/details"
import type { Terrain } from "@/lib/terrain"
import { stageProps } from "@/lib/view-matrix"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { MapAssetsLayer } from "./MapAssetsLayer"
import { MapBiomeLayer } from "./MapBiomeLayer"
import { MapBrushLayer } from "./MapBrushLayer"
import { MapDetailLayer } from "./MapDetailLayer"
import { MapEraseAssetsLayer } from "./MapEraseAssetsLayer"
import { MapLandLayer } from "./MapLandLayer"
import { MapWaterLayer } from "./MapWaterLayer"
import { MapLandmassPick } from "./MapLandmassPick"
import { MapLassoLayer } from "./MapLassoLayer"
import { MapStampLayer } from "./MapStampLayer"
import { MapSelectionLayer } from "./MapSelectionLayer"

const NONE: ReadonlySet<string> = new Set()

type Props = {
  scene: MapScene
  // The painted ground, which is loaded before the stage is shown.
  terrain: Terrain
  size: { width: number; height: number }
  view: BuilderView
  stageRef: RefObject<Konva.Stage | null>
  tool: BuilderTool
  // A drag turns the view, so the stage is not dragged along.
  rotating: boolean
  // Whether a lasso now cuts land away instead of adding it.
  cutting: boolean
  // How the select tool picks art on the empty canvas.
  selectMode: SelectMode
  // False while the scene must not change, as when publishing.
  editable: boolean
  onLasso: (points: Pair[], cut: boolean, scale: number) => void
  landTool: LandTool
  stamp: Stamp
  placement: StampPlacement
  onShape: (outline: Polygon, cut: boolean) => void
  editing: AssetEditing
  showAssets: boolean
  pick: AssetPicker
  brush: Brush
  onPaint: (paint: Paint) => void
  onPaintDetails: (details: Paint) => void
  onEraseAssets: (ids: string[]) => void
  // Shift is held: rotating snaps to 15 degrees.
  snapRotation: boolean
  // Alt is held: a press on art drags a copy of it instead (see MapSelectionLayer).
  altHeld: boolean
  onWheel: (event: Konva.KonvaEventObject<WheelEvent>) => void
  onPan: (x: number, y: number) => void
  // While the stage is being dragged.
  onPanning: (x: number, y: number) => void
}

// The canvas, drawn in three layers, since every layer is a canvas of the page's
// size and Konva advises against more than about five:
// - "surfaces": what is under the art and changes seldom (the sheet's shadow, the
//   sea, the water, the land, the biomes and the coast), in the scene's fixed
//   order. Painting redraws this layer, and only this one;
// - the assets, which dragging one redraws, and only that;
// - "chrome": the editor's own things (the selection and its handles, the brush
//   ring, the lasso's outline), which are never in the rendered image.
// Anything named "chrome" is left out when the map is rendered.
export function MapBuilderStage(props: Props) {
  const { scene, terrain, size, view, stageRef, tool, cutting, editable, editing, onWheel, onPan } = props
  const { canvas } = scene
  const land = useShownLand(scene.land, scene.style.roundness, canvas)
  const surface = useBiomeSurface(canvas, terrain)
  const detailSurface = useDetailSurface(canvas)
  // What the eraser is taking away, if it is the tool; and the art it has touched.
  const eraser = tool === "eraser" ? props.brush.erase : null
  const [fading, setFading] = useState<ReadonlySet<string>>(NONE)
  const paintingDetails = tool === "brush" && props.brush.layer === "details"
  const painting = editable && (paintingDetails || eraser === "details")
  // Paint sticks where the land is as it is shown, rounded corners and all, so
  // that none of the land you see is out of its reach.
  const mask = useMemo(() => ({ mask: landMask(land, canvas), ...gridSize(canvas) }), [land, canvas])
  // The details' mask is a byte for each canvas pixel, so it is only made when they are painted.
  const detailMask = useMemo(
    () =>
      painting
        ? { mask: landMask(land, canvas, DETAIL_CELL), ...gridSize(canvas, DETAIL_CELL) }
        : { mask: new Uint8Array(0), cols: 0, rows: 0 },
    [painting, land, canvas]
  )

  return (
    <Stage
      ref={stageRef}
      width={size.width}
      height={size.height}
      {...stageProps(view)}
      // Only the pan tool drags the canvas; the middle button pans from any
      // tool (see useBuilderViewport).
      draggable={tool === "hand" && !props.rotating}
      onWheel={onWheel}
      onDragMove={(event) => {
        if (event.target === event.target.getStage()) props.onPanning(event.target.x(), event.target.y())
      }}
      onDragEnd={(event) => {
        if (event.target === event.target.getStage()) onPan(event.target.x(), event.target.y())
      }}
    >
      <Layer name="surfaces" listening={false}>
        {/* The canvas lies on the surface like a sheet. */}
        <Group name="chrome">
          <Rect
            width={canvas.width}
            height={canvas.height}
            fill="#000"
            shadowColor="#000"
            shadowBlur={90}
            shadowOffsetY={24}
            shadowOpacity={0.3}
          />
        </Group>
        <KonvaImage name="sea" image={terrain.sea} width={canvas.width} height={canvas.height} />
        <MapWaterLayer land={land} style={scene.style} canvas={canvas} view={view} size={size} />
        <MapLandLayer land={land} background={canvas.background} texture={terrain.land} textureScale={terrain.scale} />
        <MapBiomeLayer land={land} canvas={canvas} style={scene.style} paint={scene.paint} surface={surface}>
          <MapDetailLayer land={land} canvas={canvas} details={scene.details} surface={detailSurface} />
        </MapBiomeLayer>
      </Layer>
      <MapAssetsLayer
        canvas={canvas}
        land={land}
        paint={scene.paint}
        surface={surface}
        terrain={terrain}
        backdrop={terrain.sea}
        view={view}
        size={size}
        assets={scene.assets}
        visible={props.showAssets}
        altHeld={props.altHeld}
        selected={editing.selected}
        fading={fading}
        editable={editable && tool === "select"}
        onSelect={editing.select}
        onChange={editing.commit}
      />
      <Layer name="chrome">
        <MapLassoLayer
          enabled={editable && tool === "land" && props.landTool === "lasso"}
          cutting={cutting}
          onLasso={props.onLasso}
        />
        <MapStampLayer
          enabled={editable && tool === "land" && props.landTool === "shapes" && !props.placement.saving}
          stamp={props.stamp}
          cutting={cutting}
          placement={props.placement}
          canvas={canvas}
          style={scene.style}
          terrain={terrain}
          snapRotation={props.snapRotation}
          onApply={props.onShape}
        />
        {import.meta.env.DEV && (
          <MapLandmassPick
            enabled={editable && tool === "land" && props.landTool === "shapes" && props.placement.saving}
            land={scene.land}
            canvas={canvas}
            onPick={(picked) => {
              if (!picked) return
              props.placement.setSaving(false)
              props.placement.setPicked(picked)
            }}
          />
        )}
        <MapBrushLayer
          enabled={editable && (tool === "blend" || (tool === "brush" && !paintingDetails) || eraser === "biomes")}
          target={tool === "blend" ? "blend" : eraser ? "plains" : props.brush.biome}
          cell={PAINT_CELL}
          brush={props.brush}
          paint={scene.paint}
          land={mask}
          surface={surface}
          onPaint={props.onPaint}
        />
        <MapBrushLayer
          enabled={painting}
          target={eraser ? "erase" : props.brush.detail}
          cell={DETAIL_CELL}
          brush={props.brush}
          paint={scene.details}
          land={detailMask}
          surface={detailSurface}
          onPaint={props.onPaintDetails}
        />
        <MapEraseAssetsLayer
          enabled={editable && eraser === "assets"}
          brush={props.brush}
          pick={props.pick}
          onFading={setFading}
          onErase={props.onEraseAssets}
        />
        <MapSelectionLayer
          enabled={editable && tool === "select"}
          selected={editing.selected}
          assets={scene.assets}
          snapRotation={props.snapRotation}
          onSelect={editing.selectMany}
          pick={props.pick}
          mode={props.selectMode}
          onPick={editing.select}
          onClone={editing.cloneForDrag}
          onChange={editing.commit}
        />
      </Layer>
    </Stage>
  )
}
