import type { MultiPolygon, Pair } from "polygon-clipping"
import { landMask } from "@/lib/biomes/land-mask"
import { eraseOutside, gridSize } from "@/lib/biomes/paint-tiles"
import { DETAIL_CELL, DETAIL_REACH } from "@/lib/details/details"
import { addLand, cutLand, lassoToShape, stampToShape } from "@/lib/map-land"
import { prunePins } from "@/lib/map-pins"
import type { MapScene } from "@/lib/map-scene"
import type { useSceneHistory } from "./use-scene-history"

// What a lasso or a stamp does to the scene: its outline becomes land, or is cut from it.
export function useLandDrawing(scene: MapScene, change: ReturnType<typeof useSceneHistory>["change"]) {
  function applyShape(shape: MultiPolygon | null, cut: boolean, pins: Pair[] = []) {
    if (!shape) return
    const land = cut ? cutLand(scene.land, shape) : addLand(scene.land, shape)
    if (land !== scene.land && !(cut && scene.land.length === 0)) {
      // Land cut away loses its paint and details, so land drawn there again starts as plains.
      const { cols, rows } = gridSize(scene.canvas)
      const fine = gridSize(scene.canvas, DETAIL_CELL)
      change((old) => ({
        ...old,
        land,
        // Pinned points that are no longer on the coast are dropped, so they do not pile up.
        pinned: pins.length > 0 || old.pinned.length > 0 ? prunePins([...old.pinned, ...pins], land) : old.pinned,
        paint: cut ? eraseOutside(old.paint, landMask(land, old.canvas), cols, rows) : old.paint,
        details: cut
          ? eraseOutside(old.details, landMask(land, old.canvas, DETAIL_CELL, DETAIL_REACH), fine.cols, fine.rows)
          : old.details,
      }))
    }
  }

  return {
    drawLand: (points: Pair[], cut: boolean, scale: number) => applyShape(lassoToShape(points, scale, scene.canvas), cut),
    drawStamp: (outline: MultiPolygon, cut: boolean, pins: Pair[]) => applyShape(stampToShape(outline, scene.canvas), cut, pins),
  }
}
