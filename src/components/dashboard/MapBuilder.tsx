import { useCallback, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type Konva from "konva"
import { useBuilderShortcuts } from "@/hooks/use-builder-shortcuts"
import { useBuilderTools } from "@/hooks/use-builder-tools"
import { useMapStyle } from "@/hooks/use-map-style"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useTerrain } from "@/hooks/use-terrain"
import { useHeldModifiers } from "@/hooks/use-held-modifiers"
import { useLandDrawing } from "@/hooks/use-land-drawing"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPublish } from "@/hooks/use-map-publish"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useSceneHistory } from "@/hooks/use-scene-history"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { TOOL_PANEL_INSET } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import type { WorldImage } from "@/lib/world-images"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { ConfirmDialog } from "./ConfirmDialog"
import { MapBuilderBanners } from "./MapBuilderBanners"
import { MapBuilderCanvas } from "./MapBuilderCanvas"
import { MapBuilderTopBar } from "./MapBuilderTopBar"
import { MapRightPanel } from "./MapRightPanel"
import { MapSettings } from "./MapSettings"
import { MapShortcutDialog } from "./MapShortcutDialog"
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
  const terrain = useTerrain(scene.canvas)
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
  const leave = () => (fromMap ? navigate(-1) : navigate(`/app/world/${mapId}`, { replace: true }))
  // Leaving sends what is waiting first, saying so; only if that fails does it ask.
  const [leaveAsk, setLeaveAsk] = useState(false)
  const goBack = async () => {
    if (await autosave.flushNow()) leave()
    else setLeaveAsk(true)
  }

  const tools = useBuilderTools({
    assets: scene.assets,
    change: history.change,
    centre: viewport.centre,
    pointer: useCallback(() => pointer.current, []),
    locked: publishing,
  })
  const { editing } = tools
  const { alt, shift } = useHeldModifiers()
  const cutting = (tools.mode === "cut") !== alt
  const [helpOpen, setHelpOpen] = useState(false)
  useBuilderShortcuts({
    enabled: !publishing,
    tools,
    viewport,
    undo,
    redo,
    toggleHelp: () => setHelpOpen((open) => !open),
  })

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  const drawLand = useLandDrawing(scene, history.change)
  const paintBiomes = (paint: Paint) => history.change((old) => ({ ...old, paint }))

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <MapBuilderTopBar
        name={name}
        store={autosave.store}
        publishing={publishing}
        canUndo={history.canUndo && !publishing}
        canRedo={history.canRedo && !publishing}
        onUndo={undo}
        onRedo={redo}
        onBack={goBack}
        onPublish={async () => {
          if (await publish()) leave()
        }}
      />
      <MapBuilderBanners store={autosave.store} error={error} />
      <div className="flex min-h-0 flex-1">
        <MapToolStrip tool={tools.tool} disabled={publishing} onTool={tools.changeTool} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <MapToolPanel
              tool={tools.tool}
              open={panelOpen}
              cutting={cutting}
              brush={tools.brush}
              background={scene.canvas.background}
              showAssets={!tools.hideAssets}
              hasAssets={scene.assets.length > 0}
              zoom={viewport.view.scale}
              disabled={publishing}
              onOpen={setPanelOpen}
              onMode={tools.setMode}
              selectMode={tools.selectMode}
              onSelectMode={tools.setSelectMode}
              onShowAssets={(show) => tools.setHideAssets(!show)}
              onSelectAll={editing.selectAll}
              onZoom={viewport.zoomTo}
              onFit={viewport.fit}
            />
            <MapBuilderCanvas
              scene={landStyle.shown}
              terrain={terrain}
              tool={tools.activeTool}
              cutting={cutting}
              selectMode={tools.selectMode}
              editable={!publishing && !tools.armed}
              shift={shift}
              alt={alt}
              editing={editing}
              showAssets={tools.showAssets}
              armed={tools.armed}
              onStamp={(asset, at) => void editing.place(asset, at, true)}
              brush={tools.brush}
              onPaint={paintBiomes}
              viewport={viewport}
              stageRef={stage}
              pointer={pointer}
              onLasso={drawLand}
            />
          </div>
          <MapStatusBar
            view={viewport.view}
            onZoomBy={viewport.zoomBy}
            onZoomTo={viewport.zoomTo}
            onFit={viewport.fit}
            onResetTurn={viewport.resetTurn}
            onHelp={() => setHelpOpen(true)}
          />
        </div>
        <MapRightPanel
          scene={scene}
          editing={editing}
          terrain={terrain}
          viewport={viewport}
          settings={
            <MapSettings
              canvas={scene.canvas}
              style={landStyle.style}
              onBackground={setBackground}
              onPreviewStyle={landStyle.preview}
              onCommitStyle={landStyle.commit}
            />
          }
          armed={tools.armed}
          onArm={tools.armAsset}
          disabled={publishing}
        />
      </div>
      <MapShortcutDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <ConfirmDialog
        open={leaveAsk}
        title="The latest changes could not be saved"
        description="They have not reached the server. Cancel to stay and try again, or leave anyway and they may be lost."
        confirmLabel="Leave anyway"
        busy={false}
        error={null}
        onCancel={() => setLeaveAsk(false)}
        onConfirm={leave}
      />
    </div>
  )
}
