import { useState } from "react"
import type { RefObject } from "react"
import type Konva from "konva"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import type { SceneSaveState } from "@/hooks/use-scene-autosave"
import { errorMessage } from "@/lib/campaigns"
import { exportCanvas } from "@/lib/map-export"
import { loadAssetImage } from "@/lib/map-assets"
import type { MapScene } from "@/lib/map-scene"

type Autosave = {
  flush: () => Promise<boolean>
  publish: (scene: MapScene) => Promise<boolean>
  state: SceneSaveState
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// Publishing: save the draft, render it, upload the picture, and mark that same
// scene as published. The draft goes first, so the picture can never come from
// a scene that is not the saved one; the builder is locked meanwhile.
export function useMapPublish(
  stage: RefObject<Konva.Stage | null>,
  scene: MapScene,
  autosave: Autosave,
  upload: MapImageUpload
) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolves to whether the map was published.
  async function publish() {
    if (!stage.current) return false
    setPublishing(true)
    setError(null)
    try {
      if (!(await autosave.flush())) {
        setError("The draft could not be saved, so nothing was published.")
        return false
      }
      // Art still loading would be missing from the picture.
      await Promise.all(scene.assets.map((asset) => loadAssetImage(asset.asset)))
      await nextFrame()
      await nextFrame()
      const picture = await exportCanvas(stage.current, scene.canvas)
      // A failure is shown by the upload's own error, or by the draft's state.
      return (await upload.publish(picture)) && (await autosave.publish(scene))
    } catch (failure) {
      setError(errorMessage(failure))
      return false
    } finally {
      setPublishing(false)
    }
  }

  return { publishing, error: error ?? upload.error, publish }
}
