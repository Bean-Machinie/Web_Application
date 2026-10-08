import { useCallback, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useAssetEditing } from "@/hooks/use-asset-editing"
import { useAssetKeys } from "@/hooks/use-asset-keys"
import { useBrush } from "@/hooks/use-brush"
import { useMapStyle } from "@/hooks/use-map-style"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useHeldModifiers } from "@/hooks/use-held-modifiers"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPublish } from "@/hooks/use-map-publish"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useSceneHistory } from "@/hooks/use-scene-history"
import { useToolKeys } from "@/hooks/use-tool-keys"
import { useUndoKeys } from "@/hooks/use-undo-keys"
import { landMask } from "@/lib/biomes/land-mask"
import { eraseOutside, gridSize } from "@/lib/biomes/paint-tiles"
import type { Paint } from "@/lib/biomes/paint-tiles"
import { addLand, cutLand, lassoToShape } from "@/lib/map-land"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import type { WorldImage } from "@/lib/world-images"
import { SCENE_LIMIT_BYTES } from "@/lib/world-map-scenes"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapBuilderCanvas } from "./MapBuilderCanvas"
import { MapBuilderTopBar } from "./MapBuilderTopBar"
import { MapOptionsBar } from "./MapOptionsBar"
import { MapRightPanel } from "./MapRightPanel"
import { MapSettingsPopover } from "./MapSettingsPopover"
import { MapToolStrip } from "./MapToolStrip"

// How much of the most a map can hold it may take before the builder warns.
const SIZE_WARNING = 0.7

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
// an options bar for the tool in use, the canvas, and the properties and
// library on the right. Publishing renders the canvas and hands the picture to
// the same upload an image picked by hand goes through, so the rest of the app
// cannot tell, and then opens the map.
export function MapBuilder({ campaignId, mapId, name, loaded, image, onSaveImage }: Props) {
  const history = useSceneHistory(loaded.scene)
  const { scene, undo, redo } = history
  const landStyle = useMapStyle(scene, history.change)
  const autosave = useSceneAutosave(mapId, scene, loaded)
  const stage = useRef<Konva.Stage>(null)
  const viewport = useBuilderViewport(scene.canvas, stage)
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

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  function drawLand(points: Pair[], cut: boolean, scale: number) {
    const shape = lassoToShape(points, scale, scene.canvas)
    if (!shape) return
    const land = cut ? cutLand(scene.land, shape) : addLand(scene.land, shape)
    if (land !== scene.land && !(cut && scene.land.length === 0)) {
      // Land cut away loses its paint, so land drawn there again starts as plains.
      const { cols, rows } = gridSize(scene.canvas)
      history.change((old) => ({
        ...old,
        land,
        paint: cut ? eraseOutside(old.paint, landMask(land, old.canvas), cols, rows) : old.paint,
      }))
    }
  }

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
      >
        <MapSettingsPopover
          canvas={scene.canvas}
          style={landStyle.style}
          disabled={publishing}
          onBackground={setBackground}
          onPreviewStyle={landStyle.preview}
          onCommitStyle={landStyle.commit}
        />
      </MapBuilderTopBar>
      {autosave.state === "conflict" && (
        <div className="flex items-center gap-3 border-b px-3 py-2">
          <FormAlert tone="error">{autosave.error ?? "Saving failed."}</FormAlert>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}
      {autosave.bytes > SCENE_LIMIT_BYTES * SIZE_WARNING && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="warning">
            {`This map is getting large: ${(autosave.bytes / 2 ** 20).toFixed(1)} MB of the ${SCENE_LIMIT_BYTES / 2 ** 20} MB a map can hold. Past that it cannot be saved. Clear some paint or land to make room.`}
          </FormAlert>
        </div>
      )}
      {error && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
      <MapOptionsBar tool={tool} mode={mode} altHeld={alt} editing={editing}
        brush={brush}
        background={scene.canvas.background}
        onMode={setMode}
      />
      <div className="flex min-h-0 flex-1">
        <MapToolStrip tool={tool} disabled={publishing} onTool={changeTool} />
        <MapBuilderCanvas
          scene={landStyle.shown}
          tool={tool}
          cutting={cutting}
          editable={!publishing}
          shift={shift}
          editing={editing}
          brush={brush}
          onPaint={paintBiomes}
          viewport={viewport}
          stageRef={stage}
          pointer={pointer}
          onLasso={drawLand}
        />
        <MapRightPanel
          assets={scene.assets}
          editing={editing}
          viewScale={viewport.view.scale}
          disabled={publishing}
        />
      </div>
    </div>
  )
}
