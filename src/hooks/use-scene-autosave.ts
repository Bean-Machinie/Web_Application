import { useCallback, useEffect, useRef, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import type { MapScene } from "@/lib/map-scene"
import { saveMapScene } from "@/lib/world-map-scenes"
import type { LoadedScene } from "@/lib/world-map-scenes"

const DEBOUNCE_MS = 1500

export type SceneSaveState = "saved" | "saving" | "error" | "conflict"

// Keeps the draft in the database as the scene changes, a moment after each
// change. A save that finds the scene changed elsewhere stops everything: the
// builder must reload rather than overwrite the other tab. Publishing is
// separate: the draft is saved, then marked as rendered into the map image.
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
    (markRendered = false) => {
      const run = async () => {
        if (stopped.current) return false
        const next = latest.current
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

  // Leaving the builder must not drop a change still waiting to be sent.
  useEffect(
    () => () => {
      void save()
    },
    [save]
  )

  // Saves the draft and marks the map image as rendered from it.
  const publish = useCallback(async () => {
    window.clearTimeout(timer.current)
    const ok = await save(true)
    if (ok) setUnpublished(false)
    return ok
  }, [save])

  return { state, error, unpublished, flush: save, publish }
}
