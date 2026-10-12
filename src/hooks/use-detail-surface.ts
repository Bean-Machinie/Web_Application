import { useMemo } from "react"
import { createDetailSurface } from "@/lib/details/detail-surface"
import type { MapScene } from "@/lib/map-scene"
import { editorScale } from "@/lib/terrain"
import type { Terrain } from "@/lib/terrain"

// The pictures the details are drawn on, made again when the canvas changes, or the sea's
// ground, which the river is water of.
export function useDetailSurface({ width, height }: MapScene["canvas"], terrain: Terrain) {
  return useMemo(
    () => createDetailSurface({ width, height }, editorScale({ width, height }), terrain.sea),
    [width, height, terrain.sea]
  )
}
