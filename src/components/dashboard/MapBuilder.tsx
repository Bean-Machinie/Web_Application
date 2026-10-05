import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type Konva from "konva"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useAltHeld } from "@/hooks/use-alt-held"
import { useSceneHistory } from "@/hooks/use-scene-history"
import { errorMessage } from "@/lib/campaigns"
import { exportCanvas } from "@/lib/map-export"
import { addLand, cutLand, lassoToShape } from "@/lib/map-land"
import type { SceneBackground } from "@/lib/map-scene"
import type { Pair } from "polygon-clipping"
import type { WorldImage } from "@/lib/world-images"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapBuilderSidebar } from "./MapBuilderSidebar"
import type { BuilderTool, LandMode } from "./MapBuilderSidebar"
import { MapBuilderStage } from "./MapBuilderStage"
import { MapBuilderTopBar } from "./MapBuilderTopBar"
import { MapBuilderZoom } from "./MapBuilderZoom"

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
  const navigate = useNavigate()
  // Set by "Edit map", so Back returns to the map exactly as it was left, with
  // its view and how it was reached; otherwise it opens the map in place of
  // this page, so Back in the browser does not bounce between the two.
  const fromMap = (useLocation().state as { fromMap?: boolean } | null)?.fromMap
  const goBack = () =>
    fromMap ? navigate(-1) : navigate(`/app/world/${mapId}`, { replace: true })
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  async function publish() {
    if (!stage.current) return
    setPublishing(true)
    setPublishError(null)
    try {
      // The draft goes first, so the image can never come from a scene that
      // is not the saved one. Editing is locked until this is done.
      if (!(await autosave.flush())) {
        setPublishError("The draft could not be saved, so nothing was published.")
        return
      }
      const picture = await exportCanvas(stage.current, scene.canvas)
      // A failure is shown by the upload's own error, or by the draft's state.
      if (await upload.publish(picture)) await autosave.publish(scene)
    } catch (failure) {
      setPublishError(errorMessage(failure))
    } finally {
      setPublishing(false)
    }
  }

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  const [tool, setTool] = useState<BuilderTool>("land")
  const [mode, setMode] = useState<LandMode>("add")
  const altHeld = useAltHeld()
  const cutting = (mode === "cut") !== altHeld

  function drawLand(points: Pair[], cut: boolean, scale: number) {
    const shape = lassoToShape(points, scale)
    if (!shape) return
    const land = cut ? cutLand(scene.land, shape) : addLand(scene.land, shape)
    if (land !== scene.land && !(cut && scene.land.length === 0)) {
      history.change((old) => ({ ...old, land }))
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (publishing || !(event.ctrlKey || event.metaKey)) return
      if (event.target instanceof HTMLInputElement) return
      const key = event.key.toLowerCase()
      if (key === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === "y") {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo, publishing])

  const shownError = publishError ?? upload.error

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
      {shownError && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="error">{shownError}</FormAlert>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <MapBuilderSidebar
          canvas={scene.canvas}
          tool={tool}
          mode={mode}
          altHeld={altHeld}
          disabled={publishing}
          onTool={setTool}
          onMode={setMode}
          onBackground={setBackground}
        />
        <div
          ref={viewport.container}
          onPointerDown={viewport.onMiddlePan}
          className={`bg-muted relative min-w-0 flex-1 touch-none overflow-hidden ${
            tool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
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
              onLasso={drawLand}
              onWheel={viewport.onWheel}
              onPan={viewport.onPan}
            />
          )}
          <MapBuilderZoom onZoom={viewport.zoomBy} onFit={viewport.fit} />
        </div>
      </div>
    </div>
  )
}
