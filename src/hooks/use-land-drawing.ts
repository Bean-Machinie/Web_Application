import type { Pair } from "polygon-clipping"
import { landMask } from "@/lib/biomes/land-mask"
import { eraseOutside, gridSize } from "@/lib/biomes/paint-tiles"
import { addLand, cutLand, lassoToShape } from "@/lib/map-land"
import type { MapScene } from "@/lib/map-scene"
import type { useSceneHistory } from "./use-scene-history"

// What a lasso does to the scene: its outline becomes land, or is cut from it.
export function useLandDrawing(scene: MapScene, change: ReturnType<typeof useSceneHistory>["change"]) {
  return function drawLand(points: Pair[], cut: boolean, scale: number) {
    const shape = lassoToShape(points, scale, scene.canvas)
    if (!shape) return
    const land = cut ? cutLand(scene.land, shape) : addLand(scene.land, shape)
    if (land !== scene.land && !(cut && scene.land.length === 0)) {
      // Land cut away loses its paint, so land drawn there again starts as plains.
      const { cols, rows } = gridSize(scene.canvas)
      change((old) => ({
        ...old,
        land,
        paint: cut ? eraseOutside(old.paint, landMask(land, old.canvas), cols, rows) : old.paint,
      }))
    }
  }
}
