import { useCallback, useMemo, useState } from "react"
import {
  cloneAssets,
  duplicateAssets,
  flipAssets,
  nudgeAssets,
  pasteAssets,
  patchAssets,
  removeAssets,
} from "@/lib/map-asset-edit"
import type { AssetPatch } from "@/lib/map-asset-edit"
import { assetById, loadAssetInfo, placedWidth } from "@/lib/map-assets"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"

// How far a duplicate lands from the original, in canvas pixels.
const DUPLICATE_OFFSET = 36

type Point = { x: number; y: number }

// What was last copied or cut. It outlives the builder, so art can be carried
// from one map to another.
let clipboard: PlacedAsset[] = []

type Options = {
  assets: PlacedAsset[]
  change: (update: (scene: MapScene) => MapScene) => void
  // Where the middle of the view is on the canvas, for art placed by a click.
  centre: () => Point
  // Where the pointer is on the canvas, or null when it is elsewhere.
  pointer: () => Point | null
  onPlaced: () => void
}

// What can be done with the art on a map: placing it, choosing it, copying it,
// and changing the choice. Every change is one step of undo, and so of autosave.
export function useAssetEditing({ assets, change, centre, pointer, onPlaced }: Options) {
  const [picked, setPicked] = useState<string[]>([])
  const [canPaste, setCanPaste] = useState(clipboard.length > 0)
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
      additive
        ? old.includes(id)
          ? old.filter((other) => other !== id)
          : [...old, id]
        : old.includes(id)
          ? old
          : [id]
    )
  }, [])

  const selectMany = useCallback((ids: string[], additive: boolean) => {
    setPicked((old) => (additive ? [...new Set([...old, ...ids])] : ids))
  }, [])

  // Placed at a point, or at the middle of the view, at the category's usual
  // size, and chosen at once so it can be adjusted. A stamp is left as it is, so
  // the next can follow: it is not chosen, and the tool does not change.
  const place = useCallback(
    async (assetId: string, at?: Point, stamp = false) => {
      const asset = assetById(assetId)
      const info = asset && (await loadAssetInfo(assetId))
      if (!asset || !info) return
      // The width is that of what is painted, not of the picture.
      const scale = placedWidth(assetId, info.trim) / info.trim.width
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
      if (stamp) return
      setPicked([placed.id])
      onPlaced()
    },
    [centre, edit, onPlaced]
  )

  // Everything on the map, chosen and shown with the select tool.
  const selectAll = () => {
    if (assets.length === 0) return
    setPicked(assets.map((asset) => asset.id))
    onPlaced()
  }

  // Alt-drag: copies of the chosen art, where it is, are chosen in its place, so
  // that dragging goes on with them and the originals stay. Returns the copy of the
  // piece that was pressed.
  const cloneForDrag = (ids: string[], pressed: string) => {
    const { copies, idOf } = cloneAssets(assets, ids)
    if (copies.length === 0) return null
    edit((list) => [...list, ...copies])
    setPicked(copies.map((copy) => copy.id))
    return idOf.get(pressed) ?? null
  }

  const copy = () => {
    clipboard = assets.filter((asset) => selected.includes(asset.id))
    setCanPaste(clipboard.length > 0)
  }

  const remove = () => {
    edit((list) => removeAssets(list, selected))
    setPicked([])
  }

  // Where the copies' middle goes: the point given, else the pointer, else the
  // middle of the view.
  const paste = (at?: Point) => {
    const copies = pasteAssets(clipboard, at ?? pointer() ?? centre())
    if (copies.length === 0) return
    edit((list) => [...list, ...copies])
    setPicked(copies.map((copy) => copy.id))
    onPlaced()
  }

  return {
    selected,
    canPaste,
    select,
    selectMany,
    selectAll,
    cloneForDrag,
    place,
    copy,
    paste,
    remove,
    cut: () => {
      copy()
      remove()
    },
    clear: useCallback(() => setPicked([]), []),
    commit: (patches: AssetPatch[]) => edit((list) => patchAssets(list, patches)),
    flip: (axis: "x" | "y") => edit((list) => flipAssets(list, selected, axis)),
    nudge: (dx: number, dy: number) => edit((list) => nudgeAssets(list, selected, dx, dy)),
    duplicate: () => {
      const copies = duplicateAssets(assets, selected, DUPLICATE_OFFSET)
      edit(() => copies.assets)
      setPicked(copies.ids)
    },
  }
}

export type AssetEditing = ReturnType<typeof useAssetEditing>
