import { useEffect, useRef, useState } from "react"
import type Konva from "konva"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useBuilderViewport } from "@/hooks/use-builder-viewport"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { useSceneHistory } from "@/hooks/use-scene-history"
import { errorMessage } from "@/lib/campaigns"
import { exportCanvas } from "@/lib/map-export"
import type { SceneBackground } from "@/lib/map-scene"
import type { WorldImage } from "@/lib/world-images"
import type { LoadedScene } from "@/lib/world-map-scenes"
import { MapBuilderSidebar } from "./MapBuilderSidebar"
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
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  async function publish() {
    if (!stage.current) return
    setPublishing(true)
    setPublishError(null)
    try {
      const picture = await exportCanvas(stage.current, scene.canvas)
      // A failure is shown by the upload's own error, or by the draft's state.
      if (await upload.pick(picture)) await autosave.publish()
    } catch (failure) {
      setPublishError(errorMessage(failure))
    } finally {
      setPublishing(false)
    }
  }

  const setBackground = (background: SceneBackground) =>
    history.change((old) => ({ ...old, canvas: { ...old.canvas, background } }))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.target instanceof HTMLInputElement) return
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
  }, [undo, redo])

  const shownError = publishError ?? upload.error

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <MapBuilderTopBar
        name={name}
        backTo={`/app/world/${mapId}`}
        saveState={autosave.state}
        unpublished={autosave.unpublished}
        publishing={publishing}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={undo}
        onRedo={redo}
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
        <MapBuilderSidebar canvas={scene.canvas} onBackground={setBackground} />
        <div
          ref={viewport.container}
          className="bg-muted relative min-w-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        >
          {viewport.size.width > 0 && (
            <MapBuilderStage
              scene={scene}
              size={viewport.size}
              view={viewport.view}
              stageRef={stage}
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
