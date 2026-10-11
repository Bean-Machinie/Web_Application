import { useMemo } from "react"
import { createDetailSurface } from "@/lib/details/detail-surface"
import type { MapScene } from "@/lib/map-scene"
import { editorScale } from "@/lib/terrain"

// The picture the details are drawn on, made again when the canvas changes.
export function useDetailSurface({ width, height }: MapScene["canvas"]) {
  return useMemo(() => createDetailSurface({ width, height }, editorScale({ width, height })), [width, height])
}
