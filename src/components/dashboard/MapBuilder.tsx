import { useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useAssetEditing } from "@/hooks/use-asset-editing"
import { useAssetKeys } from "@/hooks/use-asset-keys"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useHeldModifiers } from "@/hooks/use-held-modifiers"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPublish } from "@/hooks/use-map-publish"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useSceneHistory } from "@/hooks/use-scene-history"
import { useUndoKeys } from "@/hooks/use-undo-keys"
import { addLand, cutLand, lassoToShape } from "@/lib/map-land"
import type { SceneBackground } from "@/lib/map-scene"
import type { WorldImage } from "@/lib/world-images"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapAssetPanel } from "./MapAssetPanel"
import { MapBuilderSidebar } from "./MapBuilderSidebar"
import type { BuilderTool, LandMode } from "./MapBuilderSidebar"
import { MapBuilderStage } from "./MapBuilderStage"
import { MapBuilderTopBar } from "./MapBuilderTopBar"
import { MapBuilderZoom } from "./MapBuilderZoom"
import { MapSelectionBar } from "./MapSelectionBar"

type Props = {
  campaignId: string
  mapId: string
  name: string
  loaded: LoadedScene
  // The map's current image, which publishing replaces.
  image: WorldImage | null
  onSaveImage: (value: WorldImage) => Promise<boolean>
}

// The full-screen map builder: a canvas to build on, and the panels around it.
// Publishing renders the canvas and hands the picture to the same upload an
// image picked by hand goes through, so the rest of the app cannot tell.
export function MapBuilder({ campaignId, mapId, name, loaded, image, onSaveImage }: Props) {
  const history = useSceneHistory(loaded.scene)
  const { scene, undo, redo } = history
  const autosave = useSceneAutosave(mapId, scene, loaded)
  const viewport = useBuilderViewport(scene.canvas)
  const stage = useRef<Konva.Stage>(null)
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
  const { alt, shift } = useHeldModifiers()
  const cutting = (mode === "cut") !== alt

  const editing = useAssetEditing({
    assets: scene.assets,
    change: history.change,
    centre: viewport.centre,
    onPlaced: () => setTool("select"),
  })
  useUndoKeys(undo, redo, !publishing)
  useAssetKeys(editing, tool === "select" && !publishing)

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  function drawLand(points: Pair[], cut: boolean, scale: number) {
    const shape = lassoToShape(points, scale)
    if (!shape) return
    const land = cut ? cutLand(scene.land, shape) : addLand(scene.land, shape)
    if (land !== scene.land && !(cut && scene.land.length === 0)) {
      history.change((old) => ({ ...old, land }))
    }
  }

  // Art dropped from the library lands where it was let go.
  function dropAsset(event: React.DragEvent) {
    const id = event.dataTransfer.getData("application/x-map-asset")
    if (!id || !stage.current) return
    event.preventDefault()
    stage.current.setPointersPositions(event.nativeEvent)
    const at = stage.current.getRelativePointerPosition()
    if (at) void editing.place(id, at)
  }

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
        onPublish={publish}
      />
      {autosave.state === "conflict" && (
        <div className="flex items-center gap-3 border-b px-3 py-2">
          <FormAlert tone="error">{autosave.error ?? "Saving failed."}</FormAlert>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}
      {error && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <MapBuilderSidebar
          canvas={scene.canvas}
          tool={tool}
          mode={mode}
          altHeld={alt}
          disabled={publishing}
          onTool={setTool}
          onMode={setMode}
          onBackground={setBackground}
        />
        <div
          ref={viewport.container}
          onPointerDown={viewport.onMiddlePan}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropAsset}
          className={`bg-muted relative min-w-0 flex-1 touch-none overflow-hidden ${
            tool === "hand"
              ? "cursor-grab active:cursor-grabbing"
              : tool === "land"
                ? "cursor-crosshair"
                : "cursor-default"
          }`}
        >
          {viewport.size.width > 0 && (
            <MapBuilderStage
              scene={scene}
              size={viewport.size}
              view={viewport.view}
              stageRef={stage}
              tool={tool}
              cutting={cutting}
              editable={!publishing}
              editing={editing}
              snapRotation={shift}
              onLasso={drawLand}
              onWheel={viewport.onWheel}
              onPan={viewport.onPan}
            />
          )}
          <MapSelectionBar editing={editing} />
          <MapBuilderZoom onZoom={viewport.zoomBy} onFit={viewport.fit} />
        </div>
        <MapAssetPanel onPlace={(id) => void editing.place(id)} disabled={publishing} />
      </div>
    </div>
  )
}
