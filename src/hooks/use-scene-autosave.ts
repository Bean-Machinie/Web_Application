import { useCallback, useEffect, useRef, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import type { MapScene } from "@/lib/map-scene"
import { createSaveStore } from "@/lib/scene-save-store"
import { saveMapScene } from "@/lib/world-map-scenes"
import type { LoadedScene } from "@/lib/world-map-scenes"

// The draft is sent once there have been this long without a change, or, when
// changes keep coming, at the latest this long after the first of them.
const IDLE_MS = 10_000
const MAX_WAIT_MS = 60_000

// Keeps the draft in the database as the scene changes: after a pause in the
// editing, and at least once a minute through a long run of it. A save that finds
// the scene changed elsewhere stops everything: the builder must reload rather than
// overwrite the other tab. The draft is also sent when the builder is left or its
// tab is hidden, and closing the tab with changes unsent asks first. Publishing is
// separate: the caller saves the draft (flush), renders it, and then marks that same
// scene as rendered (publish).
//
// What it knows is in "store", not in state: the builder does not redraw when a save
// starts or ends, only what shows the store does (see useSaveStatus).
export function useSceneAutosave(mapId: string, scene: MapScene, loaded: LoadedScene) {
  const [store] = useState(() =>
    createSaveStore({
      unpublished: loaded.renderedAt === null || Date.parse(loaded.renderedAt) < Date.parse(loaded.updatedAt),
    })
  )
  const latest = useRef(scene)
  const saved = useRef(loaded.scene)
  const updatedAt = useRef(loaded.updatedAt)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const idleTimer = useRef<number | undefined>(undefined)
  const maxTimer = useRef<number | undefined>(undefined)
  const stopped = useRef(false)

  const clearTimers = useCallback(() => {
    window.clearTimeout(idleTimer.current)
    window.clearTimeout(maxTimer.current)
    idleTimer.current = undefined
    maxTimer.current = undefined
  }, [])

  // Saves what is newest, once whatever is already being saved is done. "manual"
  // is for a save somebody waits on, which is the only kind that says "Saving…".
  const save = useCallback(
    (markRendered = false, snapshot?: MapScene, manual = false) => {
      const run = async () => {
        if (stopped.current) return false
        const next = snapshot ?? latest.current
        if (next === saved.current && !markRendered) return true
        clearTimers()
        store.set({ state: "saving", flushing: manual })
        try {
          const result = await saveMapScene(mapId, next, updatedAt.current, markRendered)
          updatedAt.current = result.updatedAt
          saved.current = next
          store.set({
            state: latest.current === next ? "saved" : "pending",
            flushing: false,
            error: null,
            bytes: result.bytes,
            savedAt: Date.now(),
          })
          return true
        } catch (failure) {
          const message = errorMessage(failure)
          stopped.current = message.includes("changed somewhere else")
          store.set({ state: stopped.current ? "conflict" : "error", flushing: false, error: message })
          return false
        }
      }
      const result = queue.current.then(run, run)
      queue.current = result
      return result as Promise<boolean>
    },
    [mapId, store, clearTimers]
  )

  useEffect(() => {
    latest.current = scene
    if (scene === saved.current) return
    store.set({ state: "pending", unpublished: true })
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => {
      idleTimer.current = undefined
      void save()
    }, IDLE_MS)
    // The long wait starts with the first change and is not moved by the ones after.
    maxTimer.current ??= window.setTimeout(() => {
      maxTimer.current = undefined
      void save()
    }, MAX_WAIT_MS)
  }, [scene, save, store])

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
      clearTimers()
      void save()
    }
  }, [save, clearTimers])

  // Saves now, for leaving, and says so ("Saving…") while it does.
  const flushNow = useCallback(() => save(false, undefined, true), [save])

  // Marks the map image as rendered from this scene, saving it if need be.
  const publish = useCallback(
    async (rendered: MapScene) => {
      clearTimers()
      const ok = await save(true, rendered)
      if (ok) store.set({ unpublished: false })
      return ok
    },
    [save, store, clearTimers]
  )

  return { store, flush: save, flushNow, publish }
}
