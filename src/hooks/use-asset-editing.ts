import { useCallback, useMemo, useState } from "react"
import {
  duplicateAssets,
  flipAssets,
  nudgeAssets,
  patchAssets,
  removeAssets,
  reorderAssets,
} from "@/lib/map-asset-edit"
import type { AssetPatch } from "@/lib/map-asset-edit"
import { assetById, defaultWidth, loadAssetImage } from "@/lib/map-assets"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"

// How far a duplicate lands from the original, in canvas pixels.
const DUPLICATE_OFFSET = 36

type Options = {
  assets: PlacedAsset[]
  change: (update: (scene: MapScene) => MapScene) => void
  // Where the middle of the view is on the canvas, for art placed by a click.
  centre: () => { x: number; y: number }
  onPlaced: () => void
}

// What can be done with the art on a map: placing it, choosing it, and changing
// the choice. Every change is one step of undo, and so of autosave.
export function useAssetEditing({ assets, change, centre, onPlaced }: Options) {
  const [picked, setPicked] = useState<string[]>([])
  // Undo can take a selected piece away, so only what still exists counts.
  const selected = useMemo(
    () => picked.filter((id) => assets.some((asset) => asset.id === id)),
    [picked, assets]
  )

  const edit = useCallback(
    (update: (list: PlacedAsset[]) => PlacedAsset[]) =>
      change((scene) => ({ ...scene, assets: update(scene.assets) })),
    [change]
  )

  const select = useCallback((id: string, additive: boolean) => {
    setPicked((old) =>
      additive ? (old.includes(id) ? old.filter((o) => o !== id) : [...old, id]) : old.includes(id) ? old : [id]
    )
  }, [])

  const selectMany = useCallback((ids: string[], additive: boolean) => {
    setPicked((old) => (additive ? [...new Set([...old, ...ids])] : ids))
  }, [])

  // Placed at a point, or at the middle of the view, at the category's usual
  // size, and chosen at once so it can be adjusted.
  const place = useCallback(
    async (assetId: string, at?: { x: number; y: number }) => {
      const asset = assetById(assetId)
      const image = asset && (await loadAssetImage(assetId))
      if (!asset || !image) return
      const scale = defaultWidth(asset.category) / image.naturalWidth
      const spot = at ?? centre()
      const placed: PlacedAsset = {
        id: crypto.randomUUID(),
        asset: assetId,
        x: spot.x,
        y: spot.y,
        scaleX: scale,
        scaleY: scale,
        rotation: 0,
      }
      edit((list) => [...list, placed])
      setPicked([placed.id])
      onPlaced()
    },
    [centre, edit, onPlaced]
  )

  return {
    selected,
    select,
    selectMany,
    place,
    clear: useCallback(() => setPicked([]), []),
    commit: (patches: AssetPatch[]) => edit((list) => patchAssets(list, patches)),
    flip: (axis: "x" | "y") => edit((list) => flipAssets(list, selected, axis)),
    reorder: (direction: "forward" | "back") =>
      edit((list) => reorderAssets(list, selected, direction)),
    nudge: (dx: number, dy: number) => edit((list) => nudgeAssets(list, selected, dx, dy)),
    remove: () => {
      edit((list) => removeAssets(list, selected))
      setPicked([])
    },
    duplicate: () => {
      const copy = duplicateAssets(assets, selected, DUPLICATE_OFFSET)
      edit(() => copy.assets)
      setPicked(copy.ids)
    },
  }
}

export type AssetEditing = ReturnType<typeof useAssetEditing>
