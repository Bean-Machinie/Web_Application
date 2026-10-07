import type { PlacedAsset } from "./map-scene"

// What an edit changes about one asset.
export type AssetPatch = Pick<PlacedAsset, "id"> &
  Partial<Pick<PlacedAsset, "x" | "y" | "scaleX" | "scaleY" | "rotation">>

// The edits to a scene's assets, each a new list, so each is one step of undo.

export const patchAssets = (assets: PlacedAsset[], patches: AssetPatch[]) => {
  const by = new Map(patches.map((patch) => [patch.id, patch]))
  return assets.map((asset) => (by.has(asset.id) ? { ...asset, ...by.get(asset.id) } : asset))
}

export const removeAssets = (assets: PlacedAsset[], ids: string[]) =>
  assets.filter((asset) => !ids.includes(asset.id))

export const nudgeAssets = (assets: PlacedAsset[], ids: string[], dx: number, dy: number) =>
  assets.map((asset) =>
    ids.includes(asset.id) ? { ...asset, x: asset.x + dx, y: asset.y + dy } : asset
  )

// Flips about the middle of the selection, so a group mirrors as a whole and a
// single asset flips in place.
export function flipAssets(assets: PlacedAsset[], ids: string[], axis: "x" | "y") {
  const chosen = assets.filter((asset) => ids.includes(asset.id))
  if (chosen.length === 0) return assets
  const values = chosen.map((asset) => asset[axis])
  const middle = (Math.min(...values) + Math.max(...values)) / 2
  return assets.map((asset) => {
    if (!ids.includes(asset.id)) return asset
    return axis === "x"
      ? { ...asset, x: 2 * middle - asset.x, scaleX: -asset.scaleX, rotation: -asset.rotation }
      : { ...asset, y: 2 * middle - asset.y, scaleY: -asset.scaleY, rotation: -asset.rotation }
  })
}

// Copies of the chosen assets, a little aside, on top. Returns the new list and
// the copies' ids.
export function duplicateAssets(assets: PlacedAsset[], ids: string[], offset: number) {
  const copies = assets
    .filter((asset) => ids.includes(asset.id))
    .map((asset) => ({
      ...asset,
      id: crypto.randomUUID(),
      x: asset.x + offset,
      y: asset.y + offset,
    }))
  return { assets: [...assets, ...copies], ids: copies.map((copy) => copy.id) }
}

// Copies of the chosen assets exactly where they are, each with a new id, and
// which copy is of which, for a copy that is to be dragged away from its original.
export function cloneAssets(assets: PlacedAsset[], ids: string[]) {
  const idOf = new Map<string, string>()
  const copies = assets
    .filter((asset) => ids.includes(asset.id))
    .map((asset) => {
      const id = crypto.randomUUID()
      idOf.set(asset.id, id)
      return { ...asset, id }
    })
  return { copies, idOf }
}

// Copies of art, with its middle moved to a point, each with a new id.
export function pasteAssets(copied: PlacedAsset[], at: { x: number; y: number }) {
  if (copied.length === 0) return []
  const xs = copied.map((asset) => asset.x)
  const ys = copied.map((asset) => asset.y)
  const dx = at.x - (Math.min(...xs) + Math.max(...xs)) / 2
  const dy = at.y - (Math.min(...ys) + Math.max(...ys)) / 2
  return copied.map((asset) => ({
    ...asset,
    id: crypto.randomUUID(),
    x: asset.x + dx,
    y: asset.y + dy,
  }))
}
