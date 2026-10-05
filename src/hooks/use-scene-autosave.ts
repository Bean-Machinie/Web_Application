import { useCallback, useEffect, useRef, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import type { MapScene } from "@/lib/map-scene"
import { saveMapScene } from "@/lib/world-map-scenes"
import type { LoadedScene } from "@/lib/world-map-scenes"

const DEBOUNCE_MS = 1500

export type SceneSaveState = "saved" | "saving" | "error" | "conflict"

// Keeps the draft in the database as the scene changes, a moment after each
// change. A save that finds the scene changed elsewhere stops everything: the
// builder must reload rather than overwrite the other tab. The draft is also
// sent when the builder is left or its tab is hidden, and closing the tab with
// changes unsent asks first. Publishing is separate: the caller saves the draft
// (flush), renders it, and then marks that same scene as rendered (publish).
export function useSceneAutosave(mapId: string, scene: MapScene, loaded: LoadedScene) {
  const [state, setState] = useState<SceneSaveState>("saved")
  const [error, setError] = useState<string | null>(null)
  const [unpublished, setUnpublished] = useState(
    loaded.renderedAt === null || Date.parse(loaded.renderedAt) < Date.parse(loaded.updatedAt)
  )
  const latest = useRef(scene)
  const saved = useRef(loaded.scene)
  const updatedAt = useRef(loaded.updatedAt)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const timer = useRef<number | undefined>(undefined)
  const stopped = useRef(false)

  // Saves what is newest, once whatever is already being saved is done.
  const save = useCallback(
    (markRendered = false, snapshot?: MapScene) => {
      const run = async () => {
        if (stopped.current) return false
        const next = snapshot ?? latest.current
        if (next === saved.current && !markRendered) return true
        setState("saving")
        try {
          updatedAt.current = await saveMapScene(mapId, next, updatedAt.current, markRendered)
          saved.current = next
          setError(null)
          setState(latest.current === next ? "saved" : "saving")
          return true
        } catch (failure) {
          const message = errorMessage(failure)
          stopped.current = message.includes("changed somewhere else")
          setError(message)
          setState(stopped.current ? "conflict" : "error")
          return false
        }
      }
      const result = queue.current.then(run, run)
      queue.current = result
      return result as Promise<boolean>
    },
    [mapId]
  )

  useEffect(() => {
    latest.current = scene
    if (scene === saved.current) return
    setUnpublished(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void save(), DEBOUNCE_MS)
    return () => window.clearTimeout(timer.current)
  }, [scene, save])

  // Leaving the builder, or hiding its tab (the last moment a closing tab can
  // be counted on to send anything), must not drop a change still waiting.
  // Closing with unsent changes asks first.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void save()
    }
    const onUnload = (event: BeforeUnloadEvent) => {
      if (latest.current !== saved.current && !stopped.current) event.preventDefault()
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("beforeunload", onUnload)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("beforeunload", onUnload)
      void save()
    }
  }, [save])

  // Marks the map image as rendered from this scene, saving it if need be.
  const publish = useCallback(async (rendered: MapScene) => {
    window.clearTimeout(timer.current)
    const ok = await save(true, rendered)
    if (ok) setUnpublished(false)
    return ok
  }, [save])

  return { state, error, unpublished, flush: save, publish }
}
