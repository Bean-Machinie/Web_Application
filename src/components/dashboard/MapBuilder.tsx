import { useCallback, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type Konva from "konva"
import { useAssetEditing } from "@/hooks/use-asset-editing"
import { useAssetKeys } from "@/hooks/use-asset-keys"
import { useBrush } from "@/hooks/use-brush"
import { useMapStyle } from "@/hooks/use-map-style"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useHeldModifiers } from "@/hooks/use-held-modifiers"
import { useLandDrawing } from "@/hooks/use-land-drawing"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPublish } from "@/hooks/use-map-publish"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useSceneHistory } from "@/hooks/use-scene-history"
import { useSpacePan } from "@/hooks/use-space-pan"
import { useToolKeys } from "@/hooks/use-tool-keys"
import { useUndoKeys } from "@/hooks/use-undo-keys"
import { useZoomKeys } from "@/hooks/use-zoom-keys"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { TOOL_PANEL_INSET } from "@/lib/map-builder-tools"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import type { WorldImage } from "@/lib/world-images"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapBuilderBanners } from "./MapBuilderBanners"
import { MapBuilderCanvas } from "./MapBuilderCanvas"
import { MapBuilderTopBar } from "./MapBuilderTopBar"
import { MapRightPanel } from "./MapRightPanel"
import { MapSettings } from "./MapSettings"
import { MapStatusBar } from "./MapStatusBar"
import { MapToolPanel } from "./MapToolPanel"
import { MapToolStrip } from "./MapToolStrip"

type Props = {
  campaignId: string
  mapId: string
  name: string
  loaded: LoadedScene
  // The map's current image, which publishing replaces.
  image: WorldImage | null
  onSaveImage: (value: WorldImage) => Promise<boolean>
}

// The full-screen map builder, laid out like a design tool: tools down the left,
// a panel for the tool in use, the canvas, and the properties and library on
// the right. Publishing renders the canvas and hands the picture to
// the same upload an image picked by hand goes through, so the rest of the app
// cannot tell, and then opens the map.
export function MapBuilder({ campaignId, mapId, name, loaded, image, onSaveImage }: Props) {
  const history = useSceneHistory(loaded.scene)
  const { scene, undo, redo } = history
  const landStyle = useMapStyle(scene, history.change)
  const autosave = useSceneAutosave(mapId, scene, loaded)
  const stage = useRef<Konva.Stage>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const viewport = useBuilderViewport(
    scene.canvas,
    stage,
    panelOpen ? TOOL_PANEL_INSET.open : TOOL_PANEL_INSET.closed
  )
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const upload = useMapImageUpload({
    campaignId,
    entryId: mapId,
    current: image,
    onSave: onSaveImage,
  })
  const { publishing, error, publish } = useMapPublish(stage, scene, autosave, upload)

  const navigate = useNavigate()
  // Set by "Edit map", so Back returns to the map exactly as it was left, with
  // its view and how it was reached; otherwise it opens the map in place of
  // this page, so Back in the browser does not bounce between the two.
  const fromMap = (useLocation().state as { fromMap?: boolean } | null)?.fromMap
  const goBack = () =>
    fromMap ? navigate(-1) : navigate(`/app/world/${mapId}`, { replace: true })

  const [tool, setTool] = useState<BuilderTool>("land")
  const [mode, setMode] = useState<LandMode>("add")
  const brush = useBrush((tool === "brush" || tool === "blend") && !publishing)
  const { alt, shift } = useHeldModifiers()
  const cutting = (mode === "cut") !== alt
  const [hideAssets, setHideAssets] = useState(false)
  const showAssets = !hideAssets || tool !== "brush"

  const editing = useAssetEditing({
    assets: scene.assets,
    change: history.change,
    centre: viewport.centre,
    pointer: useCallback(() => pointer.current, []),
    onPlaced: () => setTool("select"),
  })
  // The selection only means something with the select tool.
  const { clear } = editing
  const changeTool = useCallback(
    (next: BuilderTool) => {
      setTool(next)
      if (next !== "select") clear()
    },
    [clear]
  )
  useUndoKeys(undo, redo, !publishing)
  useToolKeys(changeTool, !publishing)
  useAssetKeys(editing, !publishing)
  useZoomKeys(viewport, !publishing)
  // Space is the hand for as long as it is held, and the tool is not changed,
  // so the selection is kept.
  const activeTool = useSpacePan(!publishing) ? "hand" : tool

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  const drawLand = useLandDrawing(scene, history.change)
  const paintBiomes = (paint: Paint) => history.change((old) => ({ ...old, paint }))

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <MapBuilderTopBar
        name={name}
        saveState={autosave.state}
        unpublished={autosave.unpublished}
        publishing={publishing}
        canUndo={history.canUndo && !publishing}
        canRedo={history.canRedo && !publishing}
        onUndo={undo}
        onRedo={redo}
        onBack={goBack}
        onPublish={async () => {
          if (await publish()) goBack()
        }}
      />
      <MapBuilderBanners autosave={autosave} error={error} />
      <div className="flex min-h-0 flex-1">
        <MapToolStrip tool={tool} disabled={publishing} onTool={changeTool} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <MapToolPanel
              tool={tool}
              open={panelOpen}
              cutting={cutting}
              brush={brush}
              background={scene.canvas.background}
              showAssets={!hideAssets}
              hasAssets={scene.assets.length > 0}
              zoom={viewport.view.scale}
              disabled={publishing}
              onOpen={setPanelOpen}
              onMode={setMode}
              onShowAssets={(show) => setHideAssets(!show)}
              onSelectAll={() => editing.selectMany(scene.assets.map((asset) => asset.id), false)}
              onZoom={viewport.zoomTo}
              onFit={viewport.fit}
            />
            <MapBuilderCanvas
              scene={landStyle.shown}
              tool={activeTool}
              cutting={cutting}
              editable={!publishing}
              shift={shift}
              editing={editing}
              showAssets={showAssets}
              brush={brush}
              onPaint={paintBiomes}
              viewport={viewport}
              stageRef={stage}
              pointer={pointer}
              onLasso={drawLand}
            />
          </div>
          <MapStatusBar
            zoom={viewport.view.scale}
            onZoomBy={viewport.zoomBy}
            onZoomTo={viewport.zoomTo}
            onFit={viewport.fit}
          />
        </div>
        <MapRightPanel
          assets={scene.assets}
          editing={editing}
          settings={
            <MapSettings
              canvas={scene.canvas}
              style={landStyle.style}
              onBackground={setBackground}
              onPreviewStyle={landStyle.preview}
              onCommitStyle={landStyle.commit}
            />
          }
          viewScale={viewport.view.scale}
          disabled={publishing}
        />
      </div>
    </div>
  )
}
