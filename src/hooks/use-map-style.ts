import { useMemo, useState } from "react"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"

// The land's style while a slider is dragged: the canvas shows it at once, but
// only the value let go of is kept, as one step that can be undone.
export function useMapStyle(
  scene: MapScene,
  change: (update: (scene: MapScene) => MapScene) => void
) {
  const [preview, setPreview] = useState<MapStyle | null>(null)

  const shown = useMemo(
    () => (preview ? { ...scene, style: preview } : scene),
    [scene, preview]
  )

  function commit(style: MapStyle) {
    setPreview(null)
    const same = (Object.keys(style) as (keyof MapStyle)[]).every(
      (key) => style[key] === scene.style[key]
    )
    if (same) return
    change((old) => ({ ...old, style }))
  }

  return { shown, style: shown.style, preview: setPreview, commit }
}
