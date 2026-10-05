import { useCallback, useState } from "react"
import type { MapScene } from "@/lib/map-scene"

const LIMIT = 100

type History = { past: MapScene[]; present: MapScene; future: MapScene[] }

// The scene being edited, with undo and redo. Every change is a whole new
// scene, so each step is just the one before it kept aside.
export function useSceneHistory(initial: MapScene) {
  const [history, setHistory] = useState<History>({ past: [], present: initial, future: [] })

  const change = useCallback((update: (scene: MapScene) => MapScene) => {
    setHistory(({ past, present }) => ({
      past: [...past, present].slice(-LIMIT),
      present: update(present),
      future: [],
    }))
  }, [])

  const undo = useCallback(() => {
    setHistory(({ past, present, future }) =>
      past.length === 0
        ? { past, present, future }
        : { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] }
    )
  }, [])

  const redo = useCallback(() => {
    setHistory(({ past, present, future }) =>
      future.length === 0
        ? { past, present, future }
        : { past: [...past, present], present: future[0], future: future.slice(1) }
    )
  }, [])

  return {
    scene: history.present,
    change,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
